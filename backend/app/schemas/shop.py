from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
from bson import ObjectId

class ShopBase(BaseModel):
    name: str = Field(..., example="Boutique Kpayou")
    description: Optional[str] = Field(None, example="Spécialiste en accessoires de téléphone")
    location: str = Field(..., example="Cotonou")
    category: Optional[str] = Field(None, example="Électronique & Multimédia") # Rendu optionnel
    images: List[str] = Field(default=[], example=["url1.jpg", "url2.jpg"])

class ShopCreate(ShopBase):
    owner_id: str

class ShopOut(ShopBase):
    id: str = Field(..., alias="_id")
    owner_id: Optional[str] = None

    @field_validator("id", "owner_id", mode="before")
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
