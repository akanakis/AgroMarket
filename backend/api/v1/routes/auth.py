from datetime import timedelta
import secrets
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session

from database import get_db
from core.config import settings
from core.security import hash_password, verify_password
from core.auth import create_access_token, create_refresh_token, decode_token, get_current_user
from core.redis_client import is_account_locked, record_failed_login, clear_failed_logins
import models
import schemas
from google.oauth2 import id_token
from google.auth.transport import requests

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"
CSRF_COOKIE = "csrf_token"
COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=COOKIE_MAX_AGE,
        path="/api/v1/auth",
    )


def _set_csrf_cookie(response: Response) -> str:
    """Set a readable CSRF token cookie (not httpOnly so JS can read it)."""
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key=CSRF_COOKIE,
        value=csrf_token,
        httponly=False,  # Must be readable by JS
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=COOKIE_MAX_AGE,
        path="/",
    )
    return csrf_token


def _verify_csrf(request: Request) -> None:
    """Validate double-submit CSRF token (cookie == header)."""
    cookie_token = request.cookies.get(CSRF_COOKIE)
    header_token = request.headers.get("X-CSRF-Token")
    if not cookie_token or not header_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token missing")
    if not secrets.compare_digest(cookie_token, header_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token mismatch")


@router.post("/register", response_model=schemas.UserProfile, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user_in.role == "PRODUCER" and not user_in.farm_name:
        raise HTTPException(status_code=422, detail="Producers must provide a farm name")

    db_user = models.User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
        location=user_in.location,
        farm_name=user_in.farm_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    # Check lockout before querying the database (avoid user enumeration via timing)
    if is_account_locked(credentials.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later.",
        )

    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        record_failed_login(credentials.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    clear_failed_logins(credentials.email)

    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    _set_refresh_cookie(response, refresh_token)
    _set_csrf_cookie(response)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=schemas.Token)
def google_login(
    login_req: schemas.GoogleLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    try:
        if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID != "dummy":
            idinfo = id_token.verify_oauth2_token(login_req.token, requests.Request(), settings.GOOGLE_CLIENT_ID)
        else:
            # Fallback for testing when we don't have a real active client id or pass a dummy token
            # In production, never do this without verifying
            if login_req.token.startswith("dummy_"):
                email = login_req.token.replace("dummy_", "")
                idinfo = {
                    "email": email,
                    "name": "Dummy Google User",
                    "email_verified": True
                }
            else:
                raise ValueError("Invalid Google Client ID configuration")

        if not idinfo.get("email_verified"):
            raise HTTPException(status_code=400, detail="Google email not verified")
            
        email = idinfo["email"]
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            # Create a new user if it doesn't exist
            user = models.User(
                email=email,
                name=idinfo.get("name", "Unknown Name"),
                password_hash="oauth_user", # We do not need a real password
                role=login_req.role,
                location=login_req.location,
                farm_name=login_req.farm_name if login_req.role == "PRODUCER" else None,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        token_data = {"sub": str(user.id), "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        _set_refresh_cookie(response, refresh_token)
        _set_csrf_cookie(response)
        
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")


def _do_refresh(token: str, response: Response, db: Session) -> dict:
    """Shared refresh logic used by both cookie-based and header-based flows."""
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    token_data = {"sub": str(user.id), "role": user.role}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    _set_refresh_cookie(response, new_refresh_token)
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
    }


@router.post("/refresh", response_model=schemas.Token)
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    """Cookie-based token refresh (web clients). Requires CSRF double-submit cookie."""
    _verify_csrf(request)
    token = request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    result = _do_refresh(token, response, db)
    _set_csrf_cookie(response)  # Rotate CSRF token on each refresh
    return result


@router.post("/refresh/mobile", response_model=schemas.TokenWithRefresh)
def refresh_token_mobile(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Header-based token refresh for mobile clients (no cookie support).
    Expects: Authorization: Bearer <refresh_token>
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    token = auth_header[len("Bearer "):]
    return _do_refresh(token, response, db)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=REFRESH_COOKIE,
        path="/api/v1/auth",
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=schemas.UserProfile)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
