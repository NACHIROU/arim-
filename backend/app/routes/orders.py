from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId

from app.db.database import orders, shops
from app.schemas.order import OrderCreate, OrderOut
from app.schemas.users import UserOut
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=OrderOut)
async def create_order(
    order_data: OrderCreate,
    current_user: UserOut = Depends(get_current_user)
):
    """
    Crée une nouvelle commande et gère manuellement la conversion des ID.
    """
    sub_orders_for_db = []
    for so in order_data.sub_orders:
        sub_order_dict = so.model_dump()
        # On s'assure de stocker un vrai ObjectId dans la BDD
        if ObjectId.is_valid(sub_order_dict["shop_id"]):
            sub_order_dict["shop_id"] = ObjectId(sub_order_dict["shop_id"])
            print(f"Shop ID validé : {sub_order_dict['shop_id']}")
        else:
            raise HTTPException(status_code=400, detail=f"ID de boutique invalide : {sub_order_dict['shop_id']}")
        sub_orders_for_db.append(sub_order_dict)
        
    new_order_doc = {
        "user_id": ObjectId(current_user.id),
        "shipping_address": order_data.shipping_address,
        "total_price": order_data.total_price,
        "sub_orders": sub_orders_for_db,
        "status": "En attente",
        "created_at": datetime.utcnow(),
        "is_archived": False
    }

    result = await orders.insert_one(new_order_doc)
    created_order = await orders.find_one({"_id": result.inserted_id})

    # --- CORRECTION FINALE : Conversion manuelle avant de retourner ---
    # On transforme tous les ObjectId en string pour que Pydantic soit content.
    created_order["_id"] = str(created_order["_id"])
    created_order["user_id"] = str(created_order["user_id"])
    for sub in created_order.get("sub_orders", []):
        sub["shop_id"] = str(sub["shop_id"])

    return OrderOut.model_validate(created_order)


@router.get("/my-orders", response_model=List[OrderOut])
async def get_my_orders(current_user: UserOut = Depends(get_current_user), archived: bool = False):

    query = {
        "user_id": ObjectId(current_user.id),
        "is_archived": archived
    }
    user_orders = await orders.find(query).sort("created_at", -1).to_list(length=None)
    

    for order in user_orders:
        order["_id"] = str(order["_id"])
        order["user_id"] = str(order["user_id"])
        for sub in order.get("sub_orders", []):
            sub["shop_id"] = str(sub["shop_id"])

    return [OrderOut.model_validate(order) for order in user_orders]

@router.patch("/{order_id}/archive", response_model=OrderOut)
async def archive_order(order_id: str, current_user: UserOut = Depends(get_current_user)):
    """
    Permet à un utilisateur d'archiver sa propre commande.
    """
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID de commande invalide")

    # On vérifie que la commande appartient bien à l'utilisateur
    query = {"_id": ObjectId(order_id), "user_id": ObjectId(current_user.id)}
    update = {"$set": {"is_archived": True}}
    
    updated_order = await orders.find_one_and_update(query, update, return_document=True)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Commande non trouvée ou non autorisée.")
        
    return OrderOut.model_validate(updated_order)


@router.patch("/{order_id}/unarchive", response_model=OrderOut)
async def unarchive_order(order_id: str, current_user: UserOut = Depends(get_current_user)):
    """
    Permet à un utilisateur de désarchiver sa propre commande.
    """
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID de commande invalide")

    query = {"_id": ObjectId(order_id), "user_id": ObjectId(current_user.id)}
    update = {"$set": {"is_archived": False}}
    
    updated_order = await orders.find_one_and_update(query, update, return_document=True)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Commande non trouvée ou non autorisée.")
        
    return OrderOut.model_validate(updated_order)