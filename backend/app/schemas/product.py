from typing import List, Optional
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
    # On a un seul champ 'id' qui est un alias pour '_id'
    id: str = Field(..., alias="_id")
    images: List[str] = Field(default=[])
    shop_id: str

    # Le validateur ne cible que les champs 'id' et 'shop_id'
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
    _id: str
    name: str
    contact_phone: Optional[str] = None 

class ProductWithShopInfo(ProductOut):
    seller: Optional[str] = None
    shop: Optional[ShopInfo] = None

