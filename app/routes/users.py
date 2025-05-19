from fastapi import APIRouter, HTTPException, status
from app.schemas.users import UserCreate, UserOut
from app.services.users_services import create_user

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
async def get_current_user(current_user: UserOut):
    return current_user