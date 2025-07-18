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
    # ... (logique pour trouver les commandes du marchand) ...
    merchant_orders = await orders.find(Query).sort("created_at", -1).to_list(length=None)
    
    # --- On ajoute la conversion manuelle ici aussi ---
    for order in merchant_orders:
        order["_id"] = str(order["_id"])
        order["user_id"] = str(order["user_id"])
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