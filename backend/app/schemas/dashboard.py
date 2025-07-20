from pydantic import BaseModel
from typing import List
from .order import OrderOut

class ShopWithOrders(BaseModel):
    shop_id: str
    shop_name: str
    orders: List[OrderOut]