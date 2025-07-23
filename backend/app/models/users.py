from typing import Optional
from bson import ObjectId


# Fonction utilitaire pour transformer les objets MongoDB
def user_helper(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "first_name": user.get("first_name"),
        "email": user.get("email"),
        "role": user.get("role"),  # "merchant" ou "user"
        "phone": user.get("phone"),
        "location": user.get("location"),
    }
