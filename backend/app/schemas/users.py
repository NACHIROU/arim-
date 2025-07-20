from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, Literal
from bson import ObjectId

# --- Schéma de base avec les champs communs ---
class UserBase(BaseModel):
    first_name: str = Field(..., example="Jean Dupont")
    email: EmailStr = Field(..., example="jean@example.com")
    phone: Optional[str] = Field(None, example="+22912345678")
    location: Optional[str] = Field(None, example="Cotonou")
    whatsapp_call_link: Optional[str] = Field(None, example="https://wa.me/2290197345678")
    is_active: bool = Field(default=True)

# --- Schéma pour la création d'un nouvel utilisateur ---
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: Literal["client", "merchant"] = Field(..., example="client")

# --- Schéma pour la mise à jour du profil par l'utilisateur ---
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    whatsapp_call_link: Optional[str] = None

# --- Schéma pour le changement de mot de passe ---
class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

# --- Schéma pour les données dans le token JWT ---
class TokenData(BaseModel):
    sub: str # 'sub' est le terme standard pour le sujet (ici, l'ID de l'utilisateur)
    role: str

# --- Schéma pour la réponse de l'API lors du login ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Schéma pour les données de l'utilisateur renvoyées par l'API (version sécurisée) ---
class UserOut(UserBase):
    id: str = Field(..., alias="_id")
    role: str
    is_active: bool = Field(default=True)

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