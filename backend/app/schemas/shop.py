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
    # On dit que 'id' est un alias pour '_id' de MongoDB
    id: str = Field(..., alias='_id')
    
    # On rend owner_id optionnel pour gérer les anciennes données
    owner_id: Optional[str] = None

    # ========================= DÉBUT DE LA CORRECTION =========================
    
    # On ajoute un validateur pour transformer les ObjectId en string
    # C'est la méthode la plus explicite et la plus sûre
    @field_validator('id', 'owner_id', mode='before')
    @classmethod
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    # On garde la configuration pour une compatibilité maximale
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    # ========================== FIN DE LA CORRECTION ==========================