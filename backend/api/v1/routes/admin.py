from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from core.auth import require_role
import models
import schemas

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(["ADMIN"])),
):
    """Platform-wide statistics for the admin dashboard."""
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    total_revenue = (
        db.query(func.sum(models.Order.total))
        .filter(models.Order.status != "Cancelled")
        .scalar()
        or 0.0
    )

    orders_by_status = {
        row.status: row.count
        for row in db.query(
            models.Order.status, func.count(models.Order.id).label("count")
        ).group_by(models.Order.status).all()
    }
    for s in ("Pending", "Processing", "Shipped", "Completed", "Cancelled"):
        orders_by_status.setdefault(s, 0)

    total_users = db.query(func.count(models.User.id)).scalar() or 0
    buyers_count = (
        db.query(func.count(models.User.id))
        .filter(models.User.role == "BUYER")
        .scalar()
        or 0
    )
    producers_count = (
        db.query(func.count(models.User.id))
        .filter(models.User.role == "PRODUCER")
        .scalar()
        or 0
    )
    total_products = db.query(func.count(models.Product.id)).scalar() or 0
    organic_products = (
        db.query(func.count(models.Product.id))
        .filter(models.Product.organic == True)
        .scalar()
        or 0
    )
    total_reviews = db.query(func.count(models.Review.id)).scalar() or 0

    return {
        "total_revenue": round(float(total_revenue), 2),
        "total_orders": total_orders,
        "orders_by_status": orders_by_status,
        "total_users": total_users,
        "buyers_count": buyers_count,
        "producers_count": producers_count,
        "total_products": total_products,
        "organic_products": organic_products,
        "total_reviews": total_reviews,
    }


@router.get("/orders", response_model=List[schemas.Order])
def list_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(["ADMIN"])),
):
    """All orders across all users, with optional status filter."""
    query = db.query(models.Order)
    if status and status != "All":
        query = query.filter(models.Order.status == status)
    return query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/users", response_model=List[schemas.UserProfile])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(["ADMIN"])),
):
    """All users (buyers, producers, admins)."""
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    return query.order_by(models.User.created_at.desc()).offset(skip).limit(limit).all()
