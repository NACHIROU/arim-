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
    Route de recherche unifiée (version finale) qui gère tous les filtres
    avec une logique de recherche et de formatage corrigée.
    """
    if not any([q, category, lat, lon, priceRange, location]) or (category == "Tous" and not any([q, lat, lon, priceRange, location])):
        return []

    # --- Logique centralisée pour le filtre de prix ---
    price_filter = {}
    if priceRange and priceRange != "Tous les prix":
        if priceRange == "100000+":
            price_filter = {"price": {"$gt": 100000}}
        else:
            try:
                min_price, max_price = map(int, priceRange.split('-'))
                price_filter = {"price": {"$gte": min_price, "$lte": max_price}}
            except ValueError:
                pass

    # --- Cas 1: Recherche par proximité (avec coordonnées) ---
    if lat is not None and lon is not None:
        
        # Filtre initial pour les boutiques (SANS le nom 'q')
        geo_query_filter = {"is_published": True}
        if category and category != "Tous": geo_query_filter["category"] = category
        if location and location != "Toutes les villes": geo_query_filter["location"] = {"$regex": location, "$options": "i"}
        
        # Filtre pour les produits dans le $lookup
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
        
    # --- Cas 2: Recherche standard (maintenant aussi avec une agrégation) ---
    else:
        # Filtre initial pour les boutiques (SANS le nom 'q')
        shop_match_filter = {"is_published": True}
        if category and category != "Tous": shop_match_filter["category"] = category
        if location and location != "Toutes les villes": shop_match_filter["location"] = {"$regex": location, "$options": "i"}

        # Filtre pour les produits dans le $lookup
        product_match_stage = {}
        if q: product_match_stage["name"] = {"$regex": q, "$options": "i"}
        if price_filter: product_match_stage.update(price_filter)
        product_lookup_pipeline = [{"$limit": 10}]
        if product_match_stage: product_lookup_pipeline.insert(0, {"$match": product_match_stage})

        pipeline = [
            {"$match": shop_match_filter},
            {"$lookup": {
                "from": "products", "localField": "_id", "foreignField": "shop_id",
                "pipeline": product_lookup_pipeline, "as": "found_products"
            }},
            {"$match": {"$or": [{"name": {"$regex": q, "$options": "i"}} if q else {}, {"found_products": {"$ne": []}}]}},
            {"$limit": 10}
        ]
        aggregated_results = await shops.aggregate(pipeline).to_list(length=None)

    # --- Formatage final des résultats (commun aux deux cas) ---
    product_results = []
    shop_results = []
    added_ids = set()

    for item in aggregated_results:
        shop_id_str = str(item["_id"])

        # On collecte les produits trouvés qui correspondent
        for product in item.get("found_products", []):
            product_id_str = str(product["_id"])
            if product_id_str not in added_ids:
                product_results.append({
                    "type": "product",
                    "data": {
                        "id": product_id_str, "name": product["name"],
                        "images": product.get("images", []), # On utilise le champ 'images' du produit
                        "shop_id": shop_id_str,
                        "shop_name": item["name"],
                        "distance": item.get("distance")
                    }
                })
                added_ids.add(product_id_str)

        # On collecte les boutiques dont le nom correspond (si aucun produit ne correspond)
        if q and q.lower() in item["name"].lower() and shop_id_str not in added_ids:
            shop_results.append({
                "type": "shop",
                "data": { 
                    "id": shop_id_str, "name": item["name"],
                    "images": item.get("images", []), # On ajoute les images de la boutique
                    "distance": item.get("distance")
                }
            })
            added_ids.add(shop_id_str)
    
    # On priorise les produits. Si on en a, on les renvoie.
    return product_results if product_results else shop_results