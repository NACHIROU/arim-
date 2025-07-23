from fastapi import APIRouter, Depends, HTTPException, Body, Query
from typing import List, Optional
from bson import ObjectId

from app.db.database import orders, shops, users
from app.schemas.order import OrderOut
from app.schemas.users import UserOut
from app.schemas.dashboard import ShopWithOrders
from app.core.dependencies import get_current_merchant

router = APIRouter()
@router.get("/orders", response_model=List[ShopWithOrders])
async def get_merchant_orders_grouped(
    current_user: UserOut = Depends(get_current_merchant),
    status_filter: Optional[str] = Query("En attente") ):
    """
    Récupère les commandes du marchand, groupées par boutique, avec filtre de statut.
    """
    # 1. Récupérer les boutiques du marchand
    merchant_shops_cursor = shops.find({"owner_id": ObjectId(current_user.id)})
    merchant_shops = await merchant_shops_cursor.to_list(length=None)
    if not merchant_shops:
        return []

    merchant_shop_ids = [s["_id"] for s in merchant_shops]
    
    # 2. On construit le filtre de base
    match_filter = {
        "sub_orders.shop_id": {"$in": merchant_shop_ids},
        "is_archived": False
    }

    # --- 3. On ajoute la logique de filtre en utilisant la bonne variable 'status' ---
    if status_filter and status_filter != "toutes":
        match_filter["sub_orders.status"] = status_filter
    # Si 'status' est 'toutes' ou None, on n'ajoute pas de filtre sur le statut.

    # 4. Pipeline pour trouver les commandes
    pipeline = [
        {"$match": match_filter},
        {"$sort": {"created_at": -1}},
        {"$lookup": {"from": "users", "localField": "user_id", "foreignField": "_id", "as": "customer"}},
        {"$unwind": "$customer"}
    ]
    all_relevant_orders = await orders.aggregate(pipeline).to_list(length=None)

    # 5. Organiser les commandes par boutique en Python
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
    Met à jour le statut d'une sous-commande et recalcule le statut global de la commande.
    """
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID de commande invalide.")

    # --- CORRECTION : On cherche le shop_id en tant que string ---
    query = {
        "_id": ObjectId(order_id),
        "sub_orders.shop_id": ObjectId(shop_id)
    }
    update = {
        "$set": {"sub_orders.$.status": status}
    }
    # 1. Mise à jour de la sous-commande
    updated_doc = await orders.find_one_and_update(query, update)
    if not updated_doc:
        raise HTTPException(status_code=404, detail="Commande non trouvée ou non autorisée pour cette boutique.")

    # 2. On récupère la commande complète pour recalculer le statut global
    updated_order_doc = await orders.find_one({"_id": ObjectId(order_id)})

    # 3. Logique de mise à jour du statut global
    sub_statuses = [so['status'] for so in updated_order_doc.get("sub_orders", [])]
    new_global_status = updated_order_doc["status"]
    if all(s == "Livrée" for s in sub_statuses):
        new_global_status = "Livrée"
    elif any(s == "En cours de livraison" for s in sub_statuses):
        new_global_status = "En cours de livraison"
    elif all(s == "Annulée" for s in sub_statuses):
        new_global_status = "Annulée"
    
    # 4. On met à jour le statut global dans la BDD
    if new_global_status != updated_order_doc["status"]:
        await orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": new_global_status}}
        )
        updated_order_doc["status"] = new_global_status

    # 5. On enrichit et on renvoie la commande finale
    customer = await users.find_one({"_id": updated_order_doc["user_id"]})
    if customer: updated_order_doc["customer"] = customer
    
    # Conversion manuelle
    updated_order_doc["_id"] = str(updated_order_doc["_id"])
    updated_order_doc["user_id"] = str(updated_order_doc["user_id"])
    if updated_order_doc.get("customer"):
        updated_order_doc["customer"]["_id"] = str(updated_order_doc["customer"]["_id"])
    for sub in updated_order_doc.get("sub_orders", []):
        sub["shop_id"] = str(sub["shop_id"])

    return OrderOut.model_validate(updated_order_doc)