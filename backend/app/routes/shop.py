import httpx
from bson import ObjectId
from fastapi import APIRouter, Form, File, HTTPException, UploadFile, Depends
from typing import List, Optional

from app.db.database import products, shops
from app.core.cloudinary import upload_images_to_cloudinary
from app.core.dependencies import get_current_merchant
from app.schemas.shop import ShopOut, ShopBase, ShopWithContact
from app.schemas.users import UserOut
from app.schemas.product import ProductOut

router = APIRouter()

# ===============================================================
# == Routes Sécurisées (pour le Dashboard du Marchand)
# ===============================================================

@router.post("/create-shop/", response_model=ShopOut)
async def create_shop(
    name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    category: str = Form(...),
    images: list[UploadFile] = File(...),
    current_user: UserOut = Depends(get_current_merchant)
):
    image_urls = await upload_images_to_cloudinary(images)
    geolocation = None
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": location, "format": "json", "limit": 1, "countrycodes": "bj"},
                headers={"User-Agent": "AriminApp/1.0"}
            )
            response.raise_for_status()
            if response.json():
                loc_data = response.json()[0]
                geolocation = {"type": "Point", "coordinates": [float(loc_data["lon"]), float(loc_data["lat"])]}
        except Exception as e:
            print(f"Avertissement géocodage : {e}")

    shop_data = {
        "name": name,
        "description": description,
        "location": location,
        "category": category,
        "images": image_urls,
        "owner_id": ObjectId(current_user.id),
        "geolocation": geolocation,
        "is_published": False,
        "contact_phone": current_user.phone
    }
    
    new_shop_result = await shops.insert_one(shop_data)
    created_shop_from_db = await shops.find_one({"_id": new_shop_result.inserted_id})
    if not created_shop_from_db:
        raise HTTPException(status_code=500, detail="Erreur : création de la boutique échouée.")
        
    return ShopOut(**created_shop_from_db)


@router.get("/my-shops/", response_model=List[ShopOut])
async def get_my_shops(current_user: UserOut = Depends(get_current_merchant)):
    cursor = shops.find({"owner_id": ObjectId(current_user.id)})
    return [ShopOut(**shop) async for shop in cursor]

@router.put("/update-shop/{shop_id}", response_model=ShopOut)
async def update_shop(
    shop_id: str,
    name: str = Form(None),
    description: str = Form(None),
    location: str = Form(None),
    category: str = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    current_user: UserOut = Depends(get_current_merchant)
):
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID de boutique invalide")

    # Vérification de la propriété de la boutique
    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop or shop["owner_id"] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Action non autorisée")

    # Préparation des données à mettre à jour
    update_data = {}
    if name is not None: update_data["name"] = name
    if description is not None: update_data["description"] = description
    if category is not None: update_data["category"] = category

    # --- Logique de Géocodage si la localisation change ---
    if location is not None:
        update_data["location"] = location
        geolocation = None
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={"q": location, "format": "json", "limit": 1, "countrycodes": "bj"},
                    headers={"User-Agent": "AriminApp/1.0"}
                )
                response.raise_for_status()
                if response.json():
                    loc_data = response.json()[0]
                    geolocation = {"type": "Point", "coordinates": [float(loc_data["lon"]), float(loc_data["lat"])]}
            except Exception as e:
                print(f"Avertissement géocodage lors de la mise à jour : {e}")
        
        update_data["geolocation"] = geolocation

    # Si de nouvelles images sont envoyées, on les téléverse et on met à jour le lien
    if images:
        image_urls = await upload_images_to_cloudinary(images)
        if image_urls:
            update_data["images"] = image_urls

    # On met à jour seulement si des données ont été fournies
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")

    await shops.update_one({"_id": ObjectId(shop_id)}, {"$set": update_data})
    
    updated_shop = await shops.find_one({"_id": ObjectId(shop_id)})
    return ShopOut(**updated_shop)

@router.delete("/delete-shop/{shop_id}", response_model=dict)
async def delete_shop(shop_id: str, current_user: UserOut = Depends(get_current_merchant)):
    if not ObjectId.is_valid(shop_id): raise HTTPException(status_code=400, detail="ID invalide")
    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop or shop["owner_id"] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Accès refusé ou boutique non trouvée")
    await products.delete_many({"shop_id": ObjectId(shop_id)}) # Supprime les produits associés
    await shops.delete_one({"_id": ObjectId(shop_id)})
    return {"message": "Boutique et produits associés supprimés"}

@router.patch("/publish/{shop_id}", response_model=dict)
async def publish_shop(shop_id: str, current_user: UserOut = Depends(get_current_merchant)):
    if not ObjectId.is_valid(shop_id): raise HTTPException(status_code=400, detail="ID invalide")
    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop or shop["owner_id"] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Accès refusé ou boutique non trouvée")
    await shops.update_one({"_id": ObjectId(shop_id)}, {"$set": {"is_published": True}})
    return {"message": "Boutique publiée avec succès"}

@router.patch("/unpublish/{shop_id}", response_model=dict)
async def unpublish_shop(shop_id: str, current_user: UserOut = Depends(get_current_merchant)):
    if not ObjectId.is_valid(shop_id): raise HTTPException(status_code=400, detail="ID invalide")
    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop or shop["owner_id"] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Accès refusé ou boutique non trouvée")
    await shops.update_one({"_id": ObjectId(shop_id)}, {"$set": {"is_published": False}})
    return {"message": "Boutique dépubliée avec succès"}



@router.get("/reverse-geocode/")
async def reverse_geocode_location(lat: float, lon: float):
    """
    Prend des coordonnées GPS et renvoie une adresse textuelle.
    """
    address = "Adresse non trouvée"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": lat, "lon": lon, "format": "json"},
                headers={"User-Agent": "AriminApp/1.0"}
            )
            response.raise_for_status()
            data = response.json()
            # On utilise le champ 'display_name' qui est l'adresse complète
            if "display_name" in data:
                address = data["display_name"]
        except Exception as e:
            print(f"Erreur de géocodage inversé: {e}")
            raise HTTPException(status_code=500, detail="Le service de géolocalisation a échoué.")
    
    return {"address": address}


# ===============================================================
# == Routes Publiques (pour les visiteurs du site)
# ===============================================================

@router.get("/public-shops/", response_model=List[ShopOut])
async def get_public_shops():
    """
    Liste toutes les boutiques dont le statut est "publié" ET dont le propriétaire est "actif".
    """
    pipeline = [
        # 1. On ne prend que les boutiques publiées
        {"$match": {"is_published": True}},
        # 2. On joint les informations du propriétaire
        {"$lookup": {
            "from": "users",
            "localField": "owner_id",
            "foreignField": "_id",
            "as": "owner_details"
        }},
        {"$unwind": "$owner_details"},
        # 3. On ne garde que celles dont le propriétaire est actif
        {"$match": {"owner_details.is_active": True}}
    ]
    
    shops_cursor = shops.aggregate(pipeline)
    return [ShopOut(**shop) async for shop in shops_cursor]

@router.get("/retrieve-shop/{shop_id}", response_model=ShopWithContact)
async def retrieve_public_shop(shop_id: str):
    """
    Récupère une seule boutique, en vérifiant qu'elle est publiée ET que son propriétaire est actif.
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    pipeline = [
        # 1. On trouve la boutique par son ID et on s'assure qu'elle est publiée
        {"$match": {"_id": ObjectId(shop_id), "is_published": True}},
        # 2. On joint les informations du propriétaire
        {"$lookup": {
            "from": "users",
            "localField": "owner_id",
            "foreignField": "_id",
            "as": "owner_details"
        }},
        {"$unwind": "$owner_details"},
        # 3. On ne garde le résultat que si le propriétaire est actif
        {"$match": {"owner_details.is_active": True}}
    ]
    
    result = await shops.aggregate(pipeline).to_list(length=1)
    if not result:
        raise HTTPException(status_code=404, detail="Boutique non trouvée, non publiée, ou propriétaire inactif.")

    return ShopWithContact(**result[0])

@router.get("/{shop_id}/products/", response_model=List[ProductOut])
async def get_public_products_by_shop(shop_id: str):
    """
    Récupère les produits d'une boutique, mais seulement si la boutique 
    est accessible au public (publiée ET propriétaire actif).
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID de boutique invalide")

    # Pipeline pour valider si la boutique est visible par le public
    validation_pipeline = [
        {"$match": {"_id": ObjectId(shop_id), "is_published": True}},
        {"$lookup": {"from": "users", "localField": "owner_id", "foreignField": "_id", "as": "owner_details"}},
        {"$unwind": "$owner_details"},
        {"$match": {"owner_details.is_active": True}}
    ]
    
    # --- CORRECTION ICI : On utilise .aggregate() et on vérifie si le résultat n'est pas vide ---
    valid_shop_result = await shops.aggregate(validation_pipeline).to_list(length=1)

    if not valid_shop_result:
        raise HTTPException(status_code=404, detail="Boutique non trouvée, non publiée, ou propriétaire inactif.")
    
    # Si la boutique est valide, on peut renvoyer ses produits
    cursor = products.find({"shop_id": ObjectId(shop_id)})
    return [ProductOut(**product) async for product in cursor]