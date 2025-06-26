from typing import Optional
from fastapi import HTTPException
from passlib.context import CryptContext
from app.schemas.users import UserCreate
from app.db.database import users

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def create_user(user: UserCreate) -> dict:
    # Vérifier si l'email est déjà utilisé
    existing_user = await users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Préparer le document utilisateur
    user_dict = user.dict()
    user_dict["role"] = "merchant"  # Par défaut
    user_dict["password"] = hash_password(user.password)

    # Insérer en base
    new_user = await users.insert_one(user_dict)

    # Récupérer et nettoyer le document
    created_user = await users.find_one({"_id": new_user.inserted_id})
    return {
        "id": str(created_user["_id"]),
        "first_name": created_user["first_name"],
        "email": created_user["email"],
        "role": created_user["role"],
        "phone": created_user.get("phone"),
        "location": created_user.get("location")
    }
