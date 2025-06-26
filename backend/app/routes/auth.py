from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.db.database import users
from app.core.security import verify_password, create_access_token
from app.schemas.token import Token
from bson import ObjectId



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users.find_one({"email": form_data.username})
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )

    return {"access_token": access_token, "token_type": "bearer"}
