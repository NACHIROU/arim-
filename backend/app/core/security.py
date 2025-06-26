from datetime import datetime, timedelta
from typing import Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

from app.db.database import users
from app.schemas.users import UserOut

load_dotenv()
# Clé secrète pour signer le token
SECRET_KEY = os.getenv("SECRET_KEY")  
ALGORITHM = os.getenv("ALGORITHM", default="HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", default=30))

# Contexte de hachage pour les mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login") 

# Vérifie un mot de passe en clair par rapport au hash stocké
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Crée un token d’accès signé
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible d'authentifier l'utilisateur",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")
        if user_email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await users.find_one({"email": user_email})
    if user is None:
        raise credentials_exception

    user["id"] = str(user["_id"])
    return UserOut(**user)
