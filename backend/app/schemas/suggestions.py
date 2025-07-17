from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId

class SuggestionBase(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    message: str = Field(..., min_length=10)

class SuggestionCreate(SuggestionBase):
    pass

class SuggestionOut(SuggestionBase):
    id: str = Field(..., alias="_id")
    status: Literal["nouveau", "lu", "répondu"]
    created_at: datetime
    admin_reply: Optional[str] = None

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class SuggestionReply(BaseModel):
    reply_message: str = Field(..., min_length=5)