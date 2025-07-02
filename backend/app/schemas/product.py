from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from bson import ObjectId

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float

class ProductCreate(ProductBase):
    shop_id: str

class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    image_url: Optional[str]

class ProductOut(ProductBase):
    id: str = Field(..., alias="_id")
    image_url: Optional[str] = ""
    shop_id: str

    @field_validator("id", "shop_id", mode="before")
    @classmethod
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class ShopInfo(BaseModel):
    id: str
    name: str

class ProductWithShopInfo(ProductOut):
    seller: Optional[str] = None
    shop: Optional[ShopInfo] = None
