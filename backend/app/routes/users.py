from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.schemas.users import UserCreate, UserOut, UserUpdate, PasswordUpdate
from app.services.users_services import create_user
from bson import ObjectId
from app.db.database import users
from app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/signup", response_model=UserOut)
async def signup(user: UserCreate):
    created_user = await create_user(user)
    if not created_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return created_user

@router.get("/me", response_model=UserOut)
async def get_current_user_route(current_user: UserOut = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
async def update_current_user(
    user_update: UserUpdate,
    current_user: UserOut = Depends(get_current_user)
):
    update_data = user_update.model_dump(exclude_unset=True)

    if "email" in update_data:
        if await users.find_one({"email": update_data["email"], "_id": {"$ne": ObjectId(current_user.id)}}):
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé par un autre compte.")

    if update_data:
        await users.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": update_data}
        )

    updated_user = await users.find_one({"_id": ObjectId(current_user.id)})
    return UserOut(**updated_user)

# --- NOUVELLE ROUTE : Mettre à jour le mot de passe ---
@router.put("/me/password", response_model=dict)
async def update_current_user_password(
    password_data: PasswordUpdate,
    current_user: UserOut = Depends(get_current_user)
):
    user_in_db = await users.find_one({"_id": ObjectId(current_user.id)})
    
    if not verify_password(password_data.current_password, user_in_db["password"]):
        raise HTTPException(status_code=400, detail="L'ancien mot de passe est incorrect.")

    hashed_password = get_password_hash(password_data.new_password)
    await users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"password": hashed_password}}
    )

    return {"message": "Mot de passe mis à jour avec Succès ✅ ."}
