from typing import Optional
from pydantic import BaseModel


class GenerationRequest(BaseModel):
    name: str
    target_type: str # "produit" ou "boutique"
    category: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None 