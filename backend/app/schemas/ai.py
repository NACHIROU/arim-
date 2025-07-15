from typing import Optional
from pydantic import BaseModel


class GenerationRequest(BaseModel):
    name: str
    target_type: str 
    category: Optional[str] = None
    location: Optional[str] = None