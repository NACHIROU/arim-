from fastapi import APIRouter, Depends, HTTPException, Body, Query
from typing import List
from bson import ObjectId

from app.db.database import orders, shops
from app.schemas.order import OrderOut
from app.schemas.users import UserOut
from app.core.dependencies import get_current_merchant

router = APIRouter()

@router.get("/orders", response_model=List[OrderOut])
async def get_merchant_orders(current_user: UserOut = Depends(get_current_merchant)):
    """
    Récupère les commandes du marchand, enrichies avec les infos du client.
    """
    # 1. Trouver les boutiques du marchand (inchangé)
    merchant_shops_cursor = shops.find({"owner_id": ObjectId(current_user.id)}, {"_id": 1})
    merchant_shop_ids = [s["_id"] for s in await merchant_shops_cursor.to_list(length=None)]

    if not merchant_shop_ids:
        return []

    # 2. On utilise une agrégation pour trouver les commandes ET joindre les infos du client
    pipeline = [
        # On trouve les commandes actives pour les boutiques du marchand
        {"$match": {
            "sub_orders.shop_id": {"$in": merchant_shop_ids},
            "is_archived": False
        }},
        {"$sort": {"created_at": -1}},
        # On joint les informations de l'utilisateur qui a passé la commande
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "customer"
        }},
        {"$unwind": "$customer"}
    ]

    merchant_orders = await orders.aggregate(pipeline).to_list(length=None)
    
    # On convertit les IDs pour la réponse
    for order in merchant_orders:
        order["_id"] = str(order["_id"])
        order["user_id"] = str(order["user_id"])
        order["customer"]["_id"] = str(order["customer"]["_id"])
        for sub in order.get("sub_orders", []):
            sub["shop_id"] = str(sub["shop_id"])
            
    return [OrderOut.model_validate(order) for order in merchant_orders]

@router.patch("/orders/{order_id}/sub_orders/{shop_id}/status", response_model=OrderOut)
async def update_sub_order_status(
    order_id: str,
    shop_id: str,
    status: str = Body(..., embed=True),
    current_user: UserOut = Depends(get_current_merchant)
):
    """
    Met à jour le statut d'une sous-commande spécifique d'un marchand.
    """
    # On pourrait ajouter plus de vérifications ici pour s'assurer que le marchand
    # est bien le propriétaire de la sous-commande qu'il essaie de modifier.
    
    query = {
        "_id": ObjectId(order_id),
        "sub_orders.shop_id": shop_id
    }
    update = {
        "$set": {"sub_orders.$.status": status}
    }

    updated_order = await orders.find_one_and_update(query, update, return_document=True)

    if not updated_order:
        raise HTTPException(status_code=404, detail="Commande non trouvée ou non autorisée.")

    return OrderOut(**updated_order)