from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from bson import ObjectId

from app.schemas.pydantic_object_id import PydanticObjectId


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


# Schéma pour les informations de la boutique imbriquées
class ShopInfo(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")  # L'API renverra "id"
    name: str
    contact_phone: Optional[str] = None


# Le schéma final et unique pour un produit renvoyé par l'API
class ProductOut(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    name: str
    description: Optional[str] = ""
    price: float
    images: List[str] = Field(default=[])
    shop_id: PydanticObjectId
    shop: Optional[ShopInfo]

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PydanticObjectId: str},
    )


class ShopInfo(BaseModel):
    id: PydanticObjectId = Field(
        ..., alias="_id"
    )  # On utilise 'id' avec un alias '_id'
    name: str
    contact_phone: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True, populate_by_name=True, arbitrary_types_allowed=True
    )


class ProductWithShopInfo(ProductOut):
    shop: Optional[ShopInfo] = None
    seller: Optional[str] = None
