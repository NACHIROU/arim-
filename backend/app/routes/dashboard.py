from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from bson import ObjectId

from app.db.database import orders, shops, users
from app.schemas.order import OrderOut
from app.schemas.users import UserOut
from app.schemas.dashboard import ShopWithOrders
from app.core.dependencies import get_current_merchant

router = APIRouter()

@router.get("/orders", response_model=List[ShopWithOrders])
async def get_merchant_orders_grouped(current_user: UserOut = Depends(get_current_merchant)):
    """
    Récupère les commandes du marchand, groupées par boutique, en utilisant le bon type d'ID.
    """
    # 1. Récupérer toutes les boutiques du marchand
    merchant_shops_cursor = shops.find({"owner_id": ObjectId(current_user.id)})
    merchant_shops = await merchant_shops_cursor.to_list(length=None)
    if not merchant_shops:
        return []

    # --- CORRECTION : On utilise la liste des ObjectId pour la requête ---
    merchant_shop_ids = [s["_id"] for s in merchant_shops]
    
    # 2. Pipeline pour trouver toutes les commandes liées à ces boutiques
    pipeline = [
        # La requête compare maintenant des ObjectId avec des ObjectId
        {"$match": {
            "sub_orders.shop_id": {"$in": merchant_shop_ids},
            "is_archived": False
        }},
        {"$sort": {"created_at": -1}},
        {"$lookup": {"from": "users", "localField": "user_id", "foreignField": "_id", "as": "customer"}},
        {"$unwind": "$customer"}
    ]
    all_relevant_orders = await orders.aggregate(pipeline).to_list(length=None)

    # 3. Organiser les commandes par boutique en Python
    response_data = []
    for shop in merchant_shops:
        shop_id_str = str(shop["_id"])
        orders_for_this_shop = []
        for order in all_relevant_orders:
            if any(str(so.get("shop_id")) == shop_id_str for so in order.get("sub_orders", [])):
                # Conversion manuelle des IDs
                order["_id"] = str(order["_id"])
                order["user_id"] = str(order["user_id"])
                order["customer"]["_id"] = str(order["customer"]["_id"])
                for sub in order.get("sub_orders", []):
                    sub["shop_id"] = str(sub["shop_id"])
                orders_for_this_shop.append(order)

        # On ajoute le groupe (même s'il n'y a pas de commande)
        response_data.append({
            "shop_id": shop_id_str,
            "shop_name": shop["name"],
            "orders": [OrderOut.model_validate(o) for o in orders_for_this_shop]
        })
            
    return response_data

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
    query = {
        "_id": ObjectId(order_id),
        "sub_orders.shop_id": ObjectId(shop_id)
    }
    update = {
        "$set": {"sub_orders.$.status": status}
    }
    updated_order = await orders.find_one_and_update(query, update, return_document=True)
    
    if not updated_order:
        raise HTTPException(status_code=404, detail="Commande non trouvée ou non autorisée.")
    # ... ajoutez la conversion manuelle ici aussi pour la cohérence de la réponse ...
    updated_order["_id"] = str(updated_order["_id"])
    updated_order["user_id"] = str(updated_order["user_id"])
    for sub in updated_order.get("sub_orders", []):
        sub["shop_id"] = str(sub["shop_id"])
        
    return OrderOut.model_validate(updated_order)