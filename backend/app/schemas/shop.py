from pydantic import BaseModel, Field
from typing import List, Optional

class ShopBase(BaseModel):
    name: str = Field(..., example="Boutique Kpayou")
    description: Optional[str] = Field(None, example="Spécialiste en accessoires de téléphone")
    location: str = Field(..., example="Cotonou")
    images: List[str] = Field(default=[], example=[
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/shops/image1.jpg",
        "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/shops/image2.jpg"
    ])

class ShopCreate(ShopBase):
    owner_id: str  # ID du marchand

class ShopOut(ShopBase):
    id: str
    owner_id: str
