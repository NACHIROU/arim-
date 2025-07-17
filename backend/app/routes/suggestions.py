from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime

from app.db.database import suggestions
from app.schemas.suggestions import SuggestionCreate, SuggestionOut, SuggestionReply
from app.schemas.users import UserOut
from app.core.dependencies import get_current_admin
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=SuggestionOut)
async def create_suggestion(suggestion_data: SuggestionCreate):
    """
    Route publique pour qu'un visiteur puisse envoyer une suggestion.
    """
    new_suggestion = {
        "name": suggestion_data.name,
        "email": suggestion_data.email,
        "message": suggestion_data.message,
        "status": "nouveau",
        "created_at": datetime.utcnow(),
        "admin_reply": None
    }
    result = await suggestions.insert_one(new_suggestion)
    created_suggestion = await suggestions.find_one({"_id": result.inserted_id})
    return SuggestionOut(**created_suggestion)
