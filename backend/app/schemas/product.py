from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from .pydantic_object_id import PydanticObjectId

# --- Schémas de base ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float

class ProductCreate(ProductBase):
    shop_id: str

# --- Schémas de réponse ---

# Schéma pour les informations de la boutique imbriquées dans un produit
class ShopInfo(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    name: str
    contact_phone: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None

# Le schéma final et unique pour un produit renvoyé par l'API
class ProductOut(ProductBase):
    id: PydanticObjectId = Field(..., alias="_id")
    images: List[str] = Field(default=[])
    shop_id: PydanticObjectId
    shop: Optional[ShopInfo] = None
    seller: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ PydanticObjectId: str }
    )

# On garde ce nom par cohérence, mais il pointe vers le même schéma final
ProductWithShopInfo = ProductOut