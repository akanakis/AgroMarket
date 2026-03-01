from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime
import re

# ==================== AUTH SCHEMAS ====================

class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal["BUYER", "PRODUCER", "ADMIN"]
    location: str = Field(min_length=2, max_length=300)
    farm_name: Optional[str] = Field(default=None, max_length=200)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int
    role: str


# ==================== USER SCHEMAS ====================

class UserProfileBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    role: Literal["BUYER", "PRODUCER", "ADMIN"]
    location: str = Field(min_length=2, max_length=300)
    farm_name: Optional[str] = Field(default=None, max_length=200)
    certifications: Optional[str] = None
    preferences: Optional[str] = None


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    location: Optional[str] = Field(default=None, min_length=2, max_length=300)
    farm_name: Optional[str] = Field(default=None, max_length=200)
    certifications: Optional[str] = None
    preferences: Optional[str] = None


class UserProfile(UserProfileBase):
    id: int
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ==================== PRODUCT SCHEMAS ====================

VALID_CATEGORIES = Literal[
    "Vegetables", "Fruits", "Dairy", "Grains", "Herbs", "Honey", "Meat", "Other"
]


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    price: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=50)
    category: VALID_CATEGORIES
    location: str = Field(min_length=2, max_length=300)
    image_url: str = Field(max_length=2048)
    organic: bool = False
    harvest_date: str = Field(max_length=20)
    expiration_date: Optional[str] = Field(default=None, max_length=20)
    max_quantity: int = Field(gt=0)


class ProductCreate(ProductBase):
    # seller_id and seller_name are injected from JWT in the route handler
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, min_length=10, max_length=5000)
    price: Optional[float] = Field(default=None, gt=0)
    unit: Optional[str] = Field(default=None, min_length=1, max_length=50)
    category: Optional[VALID_CATEGORIES] = None
    location: Optional[str] = Field(default=None, min_length=2, max_length=300)
    image_url: Optional[str] = Field(default=None, max_length=2048)
    organic: Optional[bool] = None
    harvest_date: Optional[str] = Field(default=None, max_length=20)
    expiration_date: Optional[str] = Field(default=None, max_length=20)
    max_quantity: Optional[int] = Field(default=None, gt=0)


class Product(ProductBase):
    id: int
    seller_id: int
    seller_name: str
    rating: float
    review_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ==================== REVIEW SCHEMAS ====================

class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=5, max_length=2000)
    # author and author_id are injected from JWT in the route


class Review(BaseModel):
    id: int
    product_id: int
    author_id: int
    author: str
    rating: int
    comment: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ==================== ORDER SCHEMAS ====================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    price: float = Field(gt=0)


class OrderItem(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(min_length=1)
    # customer_id, customer_name, total are set server-side from JWT + DB


class OrderStatusUpdate(BaseModel):
    status: Literal["Pending", "Processing", "Shipped", "Completed", "Cancelled"]


class OrderRating(BaseModel):
    rating: int = Field(ge=1, le=5)


class Order(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    total: float
    status: str
    rating: Optional[int] = None
    created_at: datetime
    items: List[OrderItem] = []

    model_config = {"from_attributes": True}
