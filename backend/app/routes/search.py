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
    if not q and (not category or category == "Tous"):
        return []

    shop_filter = {}
    product_filter = {}

    # --- Construction des filtres de base ---
    if q:
        shop_filter["name"] = {"$regex": q, "$options": "i"}
        product_filter["name"] = {"$regex": q, "$options": "i"}

    if category and category != "Tous":
        shop_filter["category"] = {"$in": [category, "Divers"]}

    # =================================================================
    # DÉBUT DE LA LOGIQUE DE GÉOLOCALISATION
    # =================================================================
    # Si les coordonnées sont fournies, on ajoute le filtre géospatial
    if lat is not None and lon is not None:
        shop_filter["geolocation"] = {
            "$near": {
                "$geometry": {"type": "Point", "coordinates": [lon, lat]},
                "$maxDistance": 50000 # Rayon de recherche de 50km
            }
        }
    # =================================================================
    # FIN DE LA LOGIQUE DE GÉOLOCALISATION
    # =================================================================

    # On cherche les boutiques qui correspondent aux filtres
    # Si la géoloc est active, les résultats seront AUTOMATIQUEMENT triés par distance
    shops_cursor = shops.find(shop_filter).limit(10)
    
    # On cherche les produits qui correspondent
    # D'abord, on récupère les IDs des boutiques trouvées
    temp_shops_list = await shops.find(shop_filter, {"_id": 1}).to_list(length=None)
    shop_ids = [s["_id"] for s in temp_shops_list]
    
    if shop_ids:
        product_filter["shop_id"] = {"$in": shop_ids}
    # Si aucune boutique ne correspond, on ne cherchera pas de produit
    elif category : # location à ajouter si besoin
        return []

    products_cursor = products.find(product_filter).limit(10)

    # On exécute les deux recherches en parallèle
    found_shops, found_products = await asyncio.gather(
        shops.find(shop_filter).limit(5).to_list(length=5),
        products.find(product_filter).limit(5).to_list(length=5)
    )

    # --- Formatage des résultats ---
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
        
    # Note: Si la géoloc est active, cette liste n'est pas triée globalement,
    # mais les boutiques au sein de la liste sont implicitement ordonnées par proximité.
    # Pour un tri global, l'agrégation serait nécessaire, mais cette approche est plus simple.

    return results