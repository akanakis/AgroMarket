from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from core.auth import get_current_user, require_role
from tax_service import TaxService
import models
import schemas

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["BUYER"])),
):
    # Validate products exist and calculate server-side total
    total = 0.0
    for item in order_in.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if item.quantity > product.max_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Requested quantity exceeds available stock for '{product.name}'",
            )
        total += product.price * item.quantity

    db_order = models.Order(
        customer_id=current_user.id,
        customer_name=current_user.name,
        total=round(total, 2),
        status="Pending",
    )
    db.add(db_order)
    db.flush()

    for item in order_in.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price,
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=List[schemas.Order])
def list_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if limit > 200:
        limit = 200
    if current_user.role == "BUYER":
        orders = (
            db.query(models.Order)
            .filter(models.Order.customer_id == current_user.id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    else:
        # PRODUCER sees orders that contain their products
        orders = (
            db.query(models.Order)
            .join(models.OrderItem)
            .join(models.Product)
            .filter(models.Product.seller_id == current_user.id)
            .distinct()
            .offset(skip)
            .limit(limit)
            .all()
        )
    return orders


@router.get("/seller/{seller_id}", response_model=List[schemas.Order])
def list_seller_orders(
    seller_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["PRODUCER"])),
):
    if current_user.id != seller_id:
        raise HTTPException(status_code=403, detail="You can only view your own orders")
    orders = (
        db.query(models.Order)
        .join(models.OrderItem)
        .join(models.Product)
        .filter(models.Product.seller_id == seller_id)
        .distinct()
        .all()
    )
    return orders


@router.get("/{order_id}", response_model=schemas.Order)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Buyers can only see their own orders; producers can see orders with their products
    if current_user.role == "BUYER" and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "PRODUCER":
        seller_ids = {item.product.seller_id for item in order.items if item.product}
        if current_user.id not in seller_ids:
            raise HTTPException(status_code=403, detail="Access denied")

    return order


@router.put("/{order_id}/status", response_model=schemas.Order)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["PRODUCER"])),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only producers who sell items in this order can update status
    seller_ids = {item.product.seller_id for item in order.items if item.product}
    if current_user.id not in seller_ids:
        raise HTTPException(status_code=403, detail="You are not a seller in this order")

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order


@router.put("/{order_id}/rating", response_model=schemas.Order)
def rate_order(
    order_id: int,
    rating_in: schemas.OrderRating,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["BUYER"])),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only rate your own orders")
    if order.status not in ("Completed", "Shipped"):
        raise HTTPException(status_code=400, detail="Order must be completed before rating")

    order.rating = rating_in.rating
    db.commit()

    # Update product ratings
    for item in order.items:
        product = item.product
        if product:
            product.review_count += 1
            product.rating = (
                (product.rating * (product.review_count - 1)) + rating_in.rating
            ) / product.review_count
    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}/invoice")
def get_order_invoice(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    tax_service = TaxService()
    pdf_buffer = tax_service.generate_invoice_pdf(order)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"},
    )


@router.post("/{order_id}/refund")
def refund_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["BUYER"])),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only refund your own orders")
    if order.status == "Refunded":
        raise HTTPException(status_code=400, detail="Order already refunded")

    order.status = "Refunded"
    db.commit()
    return {"message": "Refund issued successfully", "new_status": "Refunded"}
