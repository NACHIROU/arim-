from fastapi import Depends, HTTPException, status
from app.routes.users import get_current_user 
from app.schemas.users import UserOut 

async def get_current_merchant(current_user: UserOut = Depends(get_current_user)) -> UserOut:
    if current_user.role != "merchant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Action réservée aux marchands"
        )
    return current_user

async def get_current_client(current_user: UserOut = Depends(get_current_user)) -> UserOut:
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Action réservée aux clients"
        )
    return current_user

async def get_current_admin(current_user: UserOut = Depends(get_current_user)):
    """
    Dépendance qui vérifie que l'utilisateur connecté est bien un administrateur.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Droits d'administrateur requis."
        )
    return current_user