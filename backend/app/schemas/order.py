from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.schemas.users import UserOut
from .pydantic_object_id import PydanticObjectId

# --- Sous-documents ---
class OrderedProduct(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int

class SubOrder(BaseModel):
    shop_id: str
    shop_name: str 
    products: List[OrderedProduct]
    sub_total: float

# --- Schéma principal de la commande ---
class OrderBase(BaseModel):
    shipping_address: str
    total_price: float
    sub_orders: List[SubOrder]
    is_archived: bool = Field(default=False)

class OrderCreate(OrderBase):
    pass

class OrderOut(OrderBase):
    id: PydanticObjectId = Field(..., alias="_id")
    user_id: PydanticObjectId
    created_at: datetime
    status: str
    is_archived: bool = Field(default=False)
    customer: Optional[UserOut] = None # Pour les détails du client
    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = { PydanticObjectId: str }