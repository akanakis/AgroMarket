from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session

from database import get_db
from core.config import settings
from core.security import hash_password, verify_password
from core.auth import create_access_token, create_refresh_token, decode_token, get_current_user
import models
import schemas

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"
COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        max_age=COOKIE_MAX_AGE,
        path="/api/v1/auth",
    )


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
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    _set_refresh_cookie(response, refresh_token)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh", response_model=schemas.Token)
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

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
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=REFRESH_COOKIE, path="/api/v1/auth")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=schemas.UserProfile)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
