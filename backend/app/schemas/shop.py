from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
from bson import ObjectId

class ShopBase(BaseModel):
    name: str = Field(..., example="Boutique Kpayou")
    description: Optional[str] = Field(None, example="Spécialiste en accessoires de téléphone")
    location: str = Field(..., example="Cotonou")
    category: Optional[str] = Field(None, example="Électronique & Multimédia")
    images: List[str] = Field(default=[], example=["url1.jpg", "url2.jpg"])

class ShopOut(ShopBase):
    # On a un seul champ 'id' qui est un alias pour '_id'
    id: str = Field(..., alias="_id")
    owner_id: Optional[str] = None
    is_published: bool = Field(default=False)

    # Le validateur ne cible que les champs définis dans la classe : 'id' et 'owner_id'
    @field_validator("id", "owner_id", mode="before")
    @classmethod
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True, # Permet de peupler le champ 'id' en utilisant son alias '_id'
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )