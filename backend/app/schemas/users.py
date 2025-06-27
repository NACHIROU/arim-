from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal

class UserBase(BaseModel):
    first_name: str = Field(..., example="Jean")
    email: EmailStr = Field(..., example="jean@example.com")
    phone: Optional[str] = Field(None, example="+2290196000000")
    location: Optional[str] = Field(None, example="Cotonou")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: Literal["client", "merchant"] = Field(..., example="client")  # On ajoute le champ role

class UserOut(UserBase):
    id: str
    role: str
