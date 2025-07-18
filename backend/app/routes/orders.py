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
        sub_orders_for_db.append(sub_order_dict)
        
    new_order_doc = {
        "user_id": ObjectId(current_user.id),
        "shipping_address": order_data.shipping_address,
        "total_price": order_data.total_price,
        "sub_orders": sub_orders_for_db,
        "status": "En attente",
        "created_at": datetime.utcnow()
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
async def get_my_orders(current_user: UserOut = Depends(get_current_user)):
    user_orders = await orders.find({"user_id": ObjectId(current_user.id)}).sort("created_at", -1).to_list(length=None)
    
    # --- Et on ajoute la conversion manuelle ici ---
    for order in user_orders:
        order["_id"] = str(order["_id"])
        order["user_id"] = str(order["user_id"])
        for sub in order.get("sub_orders", []):
            sub["shop_id"] = str(sub["shop_id"])

    return [OrderOut.model_validate(order) for order in user_orders]