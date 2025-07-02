# In your router file (e.g., app/routers/search.py)
from fastapi import APIRouter, Query
from typing import List, Optional
import asyncio

from app.db.database import shops, products
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def unified_search(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None)
):
    """
    Route de recherche unifiée qui gère le texte, la catégorie et la proximité.
    """
    # Si la recherche est vide (sauf si on a des coordonnées), on ne renvoie rien
    if not q and (not category or category == "Tous") and (lat is None or lon is None):
        return []

    # Si les coordonnées sont fournies, nous utilisons une aggregation, c'est la meilleure méthode.
    if lat is not None and lon is not None:
        
        # --- Construction du filtre pour la recherche géospatiale ---
        geo_query_filter = {}
        if q:
            geo_query_filter["name"] = {"$regex": q, "$options": "i"}
        if category and category != "Tous":
            geo_query_filter["category"] = {"$in": [category, "Divers"]}

        # --- Définition du Pipeline d'Agrégation ---
        pipeline = [
            # 1. Cherche les boutiques proches ET les trie par distance (le plus proche en premier)
            {
                "$geoNear": {
                    "near": {"type": "Point", "coordinates": [lon, lat]},
                    "distanceField": "distance", # Crée un champ "distance" avec la distance calculée
                    "maxDistance": 50000, # 50km
                    "query": geo_query_filter, # Applique les filtres de base (nom, catégorie)
                    "spherical": True
                }
            },
            # 2. On limite le nombre de boutiques pour la performance
            { "$limit": 10 },
            
            # 3. On "joint" les produits correspondants pour chaque boutique trouvée
            {
                "$lookup": {
                    "from": "products", # La collection avec laquelle on joint
                    "localField": "_id",
                    "foreignField": "shop_id",
                    # On peut aussi filtrer les produits joints (ex: par nom)
                    "pipeline": [
                        { "$match": { "name": {"$regex": q, "$options": "i"} } } if q else {},
                        { "$limit": 5 } # Limite les produits par boutique
                    ],
                    "as": "found_products" # Le nom du tableau qui contiendra les produits
                }
            }
        ]

        # --- Exécution et formatage des résultats de l'agrégation ---
        aggregated_results = await shops.aggregate(pipeline).to_list(length=None)
        
        results = []
        for shop_with_products in aggregated_results:
            # Ajoute la boutique au résultat
            results.append({
                "type": "shop",
                "data": { 
                    "id": str(shop_with_products["_id"]), 
                    "name": shop_with_products["name"], 
                    "description": shop_with_products.get("description", ""), 
                    "images": shop_with_products.get("images", []),
                    "distance": shop_with_products.get("distance") # On peut renvoyer la distance !
                }
            })
            # Ajoute les produits trouvés pour cette boutique
            for product in shop_with_products.get("found_products", []):
                results.append({
                    "type": "product",
                    "data": {
                        "id": str(product["_id"]), 
                        "name": product["name"], 
                        "image_url": product.get("image_url", ""),
                        "shop_id": str(product.get("shop_id")),
                        "shop_name": shop_with_products["name"]
                    }
                })
        return results

    # --- Logique de secours si PAS de coordonnées (votre ancienne logique) ---
    # (Cette partie reste inchangée pour les recherches sans géolocalisation)
    shop_filter = {}
    product_filter = {}
    if q:
        shop_filter["name"] = {"$regex": q, "$options": "i"}
        product_filter["name"] = {"$regex": q, "$options": "i"}
    if category and category != "Tous":
        shop_filter["category"] = {"$in": [category, "Divers"]}
    
    found_shops_task = shops.find(shop_filter).limit(5).to_list(length=5)
    
    # Pour les produits, on doit d'abord trouver les boutiques correspondantes
    shop_ids = [s["_id"] for s in await shops.find(shop_filter, {"_id": 1}).to_list(length=None)]
    if shop_ids:
        product_filter["shop_id"] = {"$in": shop_ids}
    elif q:
        # Si aucun shop ne match le nom, on ne renvoie pas de produits non plus
        shop_ids = []

    # Ne chercher des produits que si des boutiques ont été trouvées ou si la recherche n'est pas par catégorie
    found_products_task = products.find(product_filter).limit(5).to_list(length=5) if shop_ids or not category else asyncio.sleep(0, [])

    found_shops, found_products = await asyncio.gather(found_shops_task, found_products_task)
    # ... le formatage de votre ancienne logique reste ici ...
    results = []
    # (Le formatage reste le même que dans votre version précédente)
    for shop in found_shops:
        results.append({
            "type": "shop",
            "data": { "id": str(shop["_id"]), "name": shop["name"], "description": shop.get("description", ""), "images": shop.get("images", []) }
        })

    for product in found_products:
        shop_info = await shops.find_one({"_id": product.get("shop_id")})
        results.append({
            "type": "product",
            "data": {
                "id": str(product["_id"]), "name": product["name"], "image_url": product.get("image_url", ""),
                "shop_id": str(shop_info["_id"]) if shop_info else None,
                "shop_name": shop_info["name"] if shop_info else "Inconnu"
            }
        })
    return results