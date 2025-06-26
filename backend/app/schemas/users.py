from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    first_name: str = Field(..., example="Jean")
    email: EmailStr = Field(..., example="jean@example.com")
    phone: Optional[str] = Field(None, example="+2290196000000")
    location: Optional[str] = Field(None, example="COtonou")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserOut(UserBase):
    id: str
    role: str
