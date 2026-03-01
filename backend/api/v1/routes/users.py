from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from core.auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.UserProfile])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if limit > 200:
        limit = 200
    # Only return producers — buyer accounts are private
    users = db.query(models.User).filter(models.User.role == "PRODUCER").offset(skip).limit(limit).all()
    return users


@router.get("/me", response_model=schemas.UserProfile)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserProfile)
def update_my_profile(
    profile_update: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    update_data = profile_update.model_dump(exclude_unset=True)
    _ALLOWED = frozenset({"name", "location", "farm_name", "certifications", "preferences"})
    for field in _ALLOWED.intersection(update_data):
        setattr(current_user, field, update_data[field])
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=schemas.UserProfile)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
