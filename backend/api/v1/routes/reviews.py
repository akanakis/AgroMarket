from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from core.auth import get_current_user, require_role
import models
import schemas

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/", response_model=schemas.Review, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["BUYER"])),
):
    product = db.query(models.Product).filter(models.Product.id == review_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_review = models.Review(
        product_id=review_in.product_id,
        author_id=current_user.id,
        author=current_user.name,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    # Recalculate product rating
    reviews = db.query(models.Review).filter(models.Review.product_id == review_in.product_id).all()
    product.rating = sum(r.rating for r in reviews) / len(reviews)
    product.review_count = len(reviews)
    db.commit()

    return db_review


@router.get("/product/{product_id}", response_model=List[schemas.Review])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.product_id == product_id).all()
