from fastapi import APIRouter, Query
from typing import List, Optional
import asyncio

from app.db.database import shops, products
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def unified_search(
    q: Optional[str] = Query(None, min_length=1),
    category: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None)
):
    """
    Route de recherche unifiée (version finale) qui ne cherche que dans le contenu publié.
    """
    if not q and (not category or category == "Tous") and (lat is None or lon is None):
        return []

    # --- Cas 1: Recherche par proximité ---
    if lat is not None and lon is not None:
        geo_query_filter = {"is_published": True} # Filtre de base pour le contenu publié
        if category and category != "Tous":
            geo_query_filter["category"] = {"$in": [category, "Divers"]}
        
        product_lookup_pipeline = [{"$limit": 5}]
        if q:
            product_lookup_pipeline.insert(0, {"$match": {"name": {"$regex": q, "$options": "i"}}})
        
        pipeline = [
            {"$geoNear": {"near": {"type": "Point", "coordinates": [lon, lat]}, "distanceField": "distance", "maxDistance": 50000, "query": geo_query_filter, "spherical": True}},
            {"$lookup": {"from": "products", "localField": "_id", "foreignField": "shop_id", "pipeline": product_lookup_pipeline, "as": "found_products"}},
            {"$match": {"$or": [{"name": {"$regex": q, "$options": "i"}} if q else {}, {"found_products": {"$ne": []}}]}},
            {"$limit": 10}
        ]
        aggregated_results = await shops.aggregate(pipeline).to_list(length=None)
        
        results = []
        for item in aggregated_results:
            results.append({"type": "shop", "data": {"id": str(item["_id"]), "name": item["name"], "description": item.get("description", ""), "images": item.get("images", [])}})
            for product in item.get("found_products", []):
                results.append({"type": "product", "data": {"id": str(product["_id"]), "name": product["name"], "image_url": product.get("image_url", ""), "shop_id": str(product.get("shop_id")), "shop_name": item["name"]}})
        return results

    # --- Cas 2: Recherche standard ---
    else:
        shop_filter = {"is_published": True}
        product_filter = {}
        if category and category != "Tous": shop_filter["category"] = {"$in": [category, "Divers"]}
        if q:
            shop_filter["name"] = {"$regex": q, "$options": "i"}
            product_filter["name"] = {"$regex": q, "$options": "i"}
        
        found_shops_task = shops.find(shop_filter).limit(5).to_list(length=None)
        
        shop_ids_for_products = [s["_id"] for s in await shops.find({k: v for k, v in shop_filter.items() if k != 'name'}, {"_id": 1}).to_list(length=None)]
        if shop_ids_for_products: product_filter["shop_id"] = {"$in": shop_ids_for_products}
        
        found_products_task = products.find(product_filter).limit(5).to_list(length=None) if q else asyncio.sleep(0, [])
            
        found_shops, found_products = await asyncio.gather(found_shops_task, found_products_task)
        
        results = []
        for shop in found_shops: results.append({"type": "shop", "data": {"id": str(shop["_id"]), "name": shop["name"], "description": shop.get("description", ""), "images": shop.get("images", [])}})
        for product in found_products:
            shop_info = await shops.find_one({"_id": product.get("shop_id")})
            results.append({"type": "product", "data": {"id": str(product["_id"]), "name": product["name"], "image_url": product.get("image_url", ""), "shop_id": str(product.get("shop_id")), "shop_name": shop_info["name"] if shop_info else "Inconnu"}})
        return results