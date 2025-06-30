from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.db.database import shops, products
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def unified_search(q: Optional[str] = Query(None, min_length=2)):
    """
    Route de recherche unifiée qui retourne à la fois les boutiques et les produits
    correspondant au terme de recherche.
    """
    if not q:
        return []

    results = []
    query_filter = {"name": {"$regex": q, "$options": "i"}}

    # 1. Chercher dans les boutiques
    shops_cursor = shops.find(query_filter).limit(5)
    async for shop in shops_cursor:
        results.append({
            "type": "shop",
            "data": {
                "id": str(shop["_id"]),
                "name": shop["name"],
                "description": shop.get("description", ""),
                "images": shop.get("images", [])
            }
        })

    # 2. Chercher dans les produits
    products_cursor = products.find(query_filter).limit(5)
    async for product in products_cursor:
        # Pour chaque produit, on doit retrouver le nom de sa boutique
        shop_info = await shops.find_one({"_id": product.get("shop_id")})
        
        results.append({
            "type": "product",
            "data": {
                "id": str(product["_id"]),
                "name": product["name"],
                "image_url": product.get("image_url", ""),
                # On ajoute les infos de la boutique au produit
                "shop_id": str(shop_info["_id"]) if shop_info else None,
                "shop_name": shop_info["name"] if shop_info else "Boutique inconnue"
            }
        })

    return results