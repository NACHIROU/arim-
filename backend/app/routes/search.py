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
    lon: Optional[float] = Query(None),
    priceRange: Optional[str] = Query(None),
    location: Optional[str] = Query(None)
):
    """
    Route de recherche unifiée (version finale) qui gère le texte, la catégorie, 
    la proximité, la gamme de prix et la localisation textuelle.
    """
    if not q and (not category or category == "Tous") and (lat is None or lon is None):
        return []

    # --- AJOUT : Logique centralisée pour le filtre de prix ---
    price_filter = {}
    if priceRange and priceRange != "Tous les prix":
        if priceRange == "100000+":
            price_filter = {"price": {"$gt": 100000}}
        else:
            try:
                min_price, max_price = map(int, priceRange.split('-'))
                price_filter = {"price": {"$gte": min_price, "$lte": max_price}}
            except ValueError:
                pass # Ignore invalid price range format

    # --- Cas 1: Recherche par proximité ---
    if lat is not None and lon is not None:
        
        # Le pipeline d'agrégation est inchangé car il est déjà optimisé pour récupérer toutes les données nécessaires
        geo_query_filter = {"is_published": True}
        if category and category != "Tous": geo_query_filter["category"] = category
        if location and location != "Toutes les villes": geo_query_filter["location"] = {"$regex": location, "$options": "i"}
        product_match_stage = {}
        if q: product_match_stage["name"] = {"$regex": q, "$options": "i"}
        if price_filter: product_match_stage.update(price_filter)
        product_lookup_pipeline = [{"$limit": 5}]
        if product_match_stage: product_lookup_pipeline.insert(0, {"$match": product_match_stage})
        pipeline = [
            {"$geoNear": {"near": {"type": "Point", "coordinates": [lon, lat]}, "distanceField": "distance", "maxDistance": 50000, "query": geo_query_filter, "spherical": True}},
            {"$lookup": {"from": "products", "localField": "_id", "foreignField": "shop_id", "pipeline": product_lookup_pipeline, "as": "found_products"}},
            {"$match": {"$or": [{"name": {"$regex": q, "$options": "i"}} if q else {}, {"found_products": {"$ne": []}}]}},
            {"$limit": 10}
        ]
        aggregated_results = await shops.aggregate(pipeline).to_list(length=None)
        
        # --- NOUVELLE LOGIQUE DE FORMATAGE DES RÉSULTATS ---
        product_results = []
        shop_results = []
        added_product_ids = set()

        for shop_with_products in aggregated_results:
            # On collecte d'abord tous les produits correspondants
            for product in shop_with_products.get("found_products", []):
                product_id_str = str(product["_id"])
                if product_id_str not in added_product_ids:
                    product_results.append({
                        "type": "product",
                        "data": {
                            "id": product_id_str, "name": product["name"],
                            "image_url": product.get("image_url", ""),
                            "shop_id": str(shop_with_products["_id"]),
                            "shop_name": shop_with_products["name"],
                            "distance": shop_with_products.get("distance")
                        }
                    })
                    added_product_ids.add(product_id_str)

            # On collecte les boutiques qui correspondent au nom, au cas où aucun produit ne correspondrait
            if q and q.lower() in shop_with_products["name"].lower():
                shop_results.append({
                    "type": "shop",
                    "data": { 
                        "id": str(shop_with_products["_id"]), "name": shop_with_products["name"],
                        "distance": shop_with_products.get("distance")
                    }
                })
        
        # On priorise les produits. Si on en a, on les renvoie.
        if product_results:
            return product_results
        # Sinon, s'il y a des boutiques qui correspondent, on les renvoie.
        elif shop_results:
            return shop_results
        # Sinon, on ne renvoie rien.
        else:
            return []
    # --- Cas 2: Recherche standard ---
    else:
        shop_filter = {"is_published": True}
        product_filter = {}
        
        if category and category != "Tous": shop_filter["category"] = category
        if location and location != "Toutes les villes":
            shop_filter["location"] = {"$regex": location, "$options": "i"}

        if q:
            shop_filter["name"] = {"$regex": q, "$options": "i"}
            product_filter["name"] = {"$regex": q, "$options": "i"}
        
        if price_filter:
            product_filter.update(price_filter)
        
        found_shops_task = shops.find(shop_filter).limit(5).to_list(length=None)
        
        shop_ids_for_products_query = {"is_published": True}
        if category and category != "Tous":
            shop_ids_for_products_query["category"] = category
        if location and location != "Toutes les villes":
            shop_ids_for_products_query["location"] = {"$regex": location, "$options": "i"}

        shop_ids = [s["_id"] for s in await shops.find(shop_ids_for_products_query, {"_id": 1}).to_list(length=None)]
        
        if shop_ids:
            product_filter["shop_id"] = {"$in": shop_ids}
        else:
            # If no shops match the location/category, no products will match either.
            return []

        found_products_task = products.find(product_filter).limit(5).to_list(length=None) if q or price_filter else asyncio.sleep(0, [])
            
        found_shops, found_products = await asyncio.gather(found_shops_task, found_products_task)
        
        results = []
        for shop in found_shops: results.append({"type": "shop", "data": {"id": str(shop["_id"]), "name": shop["name"], "description": shop.get("description", ""), "images": shop.get("images", [])}})
        for product in found_products:
            shop_info = await shops.find_one({"_id": product.get("shop_id")})
            results.append({"type": "product", "data": {"id": str(product["_id"]), "name": product["name"], "image_url": product.get("image_url", ""), "shop_id": str(product.get("shop_id")), "shop_name": shop_info["name"] if shop_info else "Inconnu"}})
        
        return results