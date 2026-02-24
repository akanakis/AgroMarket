from fastapi import APIRouter
from api.v1.routes import auth, products, orders, users, reviews

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(products.router)
router.include_router(orders.router)
router.include_router(users.router)
router.include_router(reviews.router)
