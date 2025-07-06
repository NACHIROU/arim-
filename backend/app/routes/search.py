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
        # 1. Filtre principal pour les boutiques
        shop_match_filter = {"is_published": True}
        if category and category != "Tous": shop_match_filter["category"] = category
        if location and location != "Toutes les villes": shop_match_filter["location"] = {"$regex": location, "$options": "i"}
        if q: shop_match_filter["name"] = {"$regex": q, "$options": "i"}

        # 2. Filtre pour les produits à l'intérieur du $lookup
        product_match_stage = {}
        if q: product_match_stage["name"] = {"$regex": q, "$options": "i"}
        if price_filter: product_match_stage.update(price_filter)
        
        product_lookup_pipeline = [{"$limit": 10}]
        if product_match_stage:
            product_lookup_pipeline.insert(0, {"$match": product_match_stage})

        # 3. Pipeline d'agrégation
        pipeline = [
            {"$match": shop_match_filter},
            {"$limit": 10},
            {"$lookup": {
                "from": "products", "localField": "_id", "foreignField": "shop_id",
                "pipeline": product_lookup_pipeline, "as": "found_products"
            }},
            # On garde la boutique si son nom a matché OU si elle contient des produits qui ont matché
            {"$match": {
                "$or": [
                    {"name": {"$regex": q, "$options": "i"}} if q else {},
                    {"found_products": {"$ne": []}}
                ]
            }}
        ]
        
        aggregated_results = await shops.aggregate(pipeline).to_list(length=None)
        
        # 4. Formatage des résultats (logique de priorité aux produits)
        product_results = []
        shop_results = []
        added_product_ids = set()

        for shop_item in aggregated_results:
            if q and q.lower() in shop_item["name"].lower():
                shop_results.append({"type": "shop", "data": {"id": str(shop_item["_id"]), "name": shop_item["name"]}})

            for product in shop_item.get("found_products", []):
                prod_id = str(product["_id"])
                if prod_id not in added_product_ids:
                    product_results.append({
                        "type": "product",
                        "data": {
                            "id": prod_id, "name": product["name"],
                            "image_url": product.get("image_url", ""),
                            "shop_id": str(shop_item["_id"]),
                            "shop_name": shop_item["name"]
                        }
                    })
                    added_product_ids.add(prod_id)

        return product_results if product_results else shop_results
