from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from app.db.database import users, shops
from app.schemas.users import UserOut
from app.core.dependencies import get_current_admin
from app.models import shop, product
from app.schemas.shop import ShopOut

router = APIRouter()


@router.get("/users", response_model=List[UserOut])
async def get_all_users(
    admin_user: UserOut = Depends(get_current_admin),
    role: Optional[str] = Query(None, enum=["client", "merchant"]),
    # --- AJOUT : Nouveaux paramètres de filtre ---
    status: Optional[str] = Query(None, enum=["active", "suspended"]),
    search: Optional[str] = Query(None, min_length=2)
):
    """
    Route pour voir tous les utilisateurs, avec filtres par rôle, statut et recherche.
    """
    query_filter = {}
    if role:
        query_filter["role"] = role
    
    # On ajoute la logique pour le filtre de statut
    if status:
        query_filter["is_active"] = (status == "active")

    # On ajoute la logique pour la recherche textuelle
    if search:
        query_filter["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    all_users = await users.find(query_filter).to_list(length=None)
    return [UserOut(**user) for user in all_users]

@router.patch("/users/{user_id}/status", response_model=dict)
async def update_user_status(
    user_id: str, 
    is_active: bool,
    admin_user: UserOut = Depends(get_current_admin)
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    
    target_user = await users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Règle de sécurité : un admin ne peut pas se suspendre lui-même
    if str(target_user["_id"]) == admin_user.id:
        raise HTTPException(status_code=403, detail="Un administrateur ne peut pas modifier son propre statut.")

    await users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": is_active}})
    action = "réactivé" if is_active else "suspendu"
    return {"message": f"L'utilisateur a été {action} avec succès."}

@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(user_id: str, admin_user: UserOut = Depends(get_current_admin)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")

    user_id_obj = ObjectId(user_id)

    target_user = await users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Règles de sécurité
    if str(target_user["_id"]) == admin_user.id:
        raise HTTPException(status_code=403, detail="Un administrateur ne peut pas se supprimer lui-même.")
    if target_user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Impossible de supprimer un autre administrateur.")
    
    if target_user.get("role") == "merchant":
        print(f"L'utilisateur {user_id} est un marchand. Suppression de ses données associées...")
        
        # 1. Trouver toutes les boutiques de ce marchand
        shops_to_delete_cursor = shop.find({"owner_id": user_id_obj}, {"_id": 1})
        shop_ids_to_delete = [s["_id"] for s in await shops_to_delete_cursor.to_list(length=None)]

        if shop_ids_to_delete:
            # 2. Supprimer tous les produits de ces boutiques
            product_delete_result = await product.delete_many({"shop_id": {"$in": shop_ids_to_delete}})
            print(f"  -> {product_delete_result.deleted_count} produits supprimés.")

            # 3. Supprimer toutes les boutiques elles-mêmes
            shop_delete_result = await shop.delete_many({"_id": {"$in": shop_ids_to_delete}})
            print(f"  -> {shop_delete_result.deleted_count} boutiques supprimées.")
    await users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "Utilisateur supprimé avec succès."}

@router.get("/users/{user_id}", response_model=UserOut)
async def get_user_by_id(user_id: str, admin_user: UserOut = Depends(get_current_admin)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    
    user = await users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
    return UserOut(**user)

# --- NOUVELLE ROUTE : Obtenir les boutiques d'un marchand spécifique ---
@router.get("/users/{user_id}/shops", response_model=List[ShopOut])
async def get_shops_by_owner(user_id: str, admin_user: UserOut = Depends(get_current_admin)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    
    shops_cursor = shops.find({"owner_id": ObjectId(user_id)})
    return [ShopOut(**shop) async for shop in shops_cursor]