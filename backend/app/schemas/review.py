from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from bson import ObjectId

# Ce que le client envoie pour créer un avis
class ReviewCreate(BaseModel):
    shop_id: str
    # CORRECTION : On définit le type (int) et on utilise Field pour ajouter des règles
    rating: int = Field(ge=1, le=5, description="Note de 1 à 5")
    message: str = Field(..., min_length=10)

# Ce que l'API renvoie pour afficher un avis
class ReviewOut(BaseModel):
    # CORRECTION : On utilise la même méthode que pour les autres schémas pour gérer les ObjectId
    id: str = Field(..., alias="_id")
    shop_id: str
    user_id: str
    author_name: str
    rating: int
    message: str
    created_at: datetime

    @field_validator("id", "shop_id", "user_id", mode="before")
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