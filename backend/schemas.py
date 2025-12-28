from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ==================== USER SCHEMAS ====================
class UserProfileBase(BaseModel):
    name: str
    role: str
    location: str
    farm_name: Optional[str] = None
    certifications: Optional[str] = None
    preferences: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== PRODUCT SCHEMAS ====================
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    unit: str
    category: str
    location: str
    seller_name: str
    image_url: str
    organic: bool = False
    harvest_date: str
    expiration_date: Optional[str] = None
    max_quantity: int

class ProductCreate(ProductBase):
    seller_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    organic: Optional[bool] = None
    harvest_date: Optional[str] = None
    expiration_date: Optional[str] = None
    max_quantity: Optional[int] = None

class Product(ProductBase):
    id: int
    seller_id: int
    rating: float
    review_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ==================== REVIEW SCHEMAS ====================
class ReviewBase(BaseModel):
    product_id: int
    author: str
    rating: int
    comment: str

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== ORDER SCHEMAS ====================
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_name: str
    total: float
    status: str = "Pending"

class OrderCreate(OrderBase):
    customer_id: Optional[int] = None
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    customer_id: Optional[int] = None
    rating: Optional[int] = None
    created_at: datetime
    items: List[OrderItem] = []
    
    class Config:
        from_attributes = True