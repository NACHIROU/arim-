import httpx
from bson import ObjectId
from fastapi import APIRouter, Form, File, HTTPException, UploadFile, Depends
from typing import List

from app.db.database import products, shops
from app.core.cloudinary import upload_images_to_cloudinary
from app.core.dependencies import get_current_merchant
from app.schemas.shop import ShopOut, ShopBase
from app.schemas.users import UserOut
from app.schemas.product import ProductOut

router = APIRouter()

@router.post("/create-shop/", response_model=ShopOut)
async def create_shop(
    name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    category: str = Form(...), # <-- Paramètre de catégorie ajouté
    images: list[UploadFile] = File(...),
    current_user: UserOut = Depends(get_current_merchant)
):
    """
    Crée une nouvelle boutique, géocode son adresse et l'enregistre en base de données.
    """
    image_urls = await upload_images_to_cloudinary(images)

    # --- Logique de Géocodage avec Nominatim ---
    geolocation = None
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": location, "format": "json", "limit": 1, "countrycodes": "bj"},
                headers={"User-Agent": "AriminApp/1.0"} # S'identifier est une bonne pratique
            )
            response.raise_for_status() # Lève une exception si la requête échoue (ex: 4xx, 5xx)
            if response.json():
                loc_data = response.json()[0]
                geolocation = {
                    "type": "Point",
                    "coordinates": [float(loc_data["lon"]), float(loc_data["lat"])]
                }
        except Exception as e:
            print(f"Avertissement : Erreur de géocodage pour l'adresse '{location}'. Erreur: {e}")
            # On continue même si le géocodage échoue, en laissant 'geolocation' à None

    # --- Préparation des données pour la base de données ---
    shop_data = {
        "name": name,
        "description": description,
        "location": location,
        "category": category, # On enregistre la catégorie
        "images": image_urls,
        "owner_id": ObjectId(current_user.id),
        "geolocation": geolocation # On enregistre les coordonnées géographiques
    }

    new_shop_result = await shops.insert_one(shop_data)
    created_shop_from_db = await shops.find_one({"_id": new_shop_result.inserted_id})

    if not created_shop_from_db:
        raise HTTPException(status_code=500, detail="Erreur : la boutique a été créée mais n'a pas pu être récupérée.")

    # On utilise le modèle Pydantic pour construire la réponse, c'est plus sûr
    return ShopOut(**created_shop_from_db)


@router.get("/retrieve-all-shops/", response_model=list[ShopOut])
async def retrieve_all_shops():
    shop_list = []
    async for shop in shops.find():
        shop_list.append(ShopOut(**shop))
    return shop_list


@router.get("/retrieve-shop/{shop_id}", response_model=ShopOut)
async def retrieve_shop(shop_id: str):
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")

    return ShopOut(**shop)


@router.get("/{shop_id}/products/", response_model=list[ProductOut])
async def get_products_by_shop(shop_id: str):
    try:
        shop_object_id = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shop_id format")

    shop_products = []
    cursor = products.find({"shop_id": shop_object_id})
    async for product in cursor:
        shop_products.append(ProductOut(**product))
    return shop_products


@router.put("/update-shop/{shop_id}", response_model=ShopOut)
async def update_shop(shop_id: str, updated_data: ShopBase, current_user: UserOut = Depends(get_current_merchant)):
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")

    if shop["owner_id"] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Accès refusé")

    update_payload = updated_data.dict(exclude_unset=True)
    
    # Bonus : si l'adresse est mise à jour, on pourrait aussi relancer le géocodage ici
    if "location" in update_payload and update_payload["location"] != shop.get("location"):
         # (Ici, on pourrait ajouter la même logique de géocodage que dans create_shop)
         pass

    await shops.update_one(
        {"_id": ObjectId(shop_id)},
        {"$set": update_payload}
    )

    updated_shop = await shops.find_one({"_id": ObjectId(shop_id)})
    return ShopOut(**updated_shop)


@router.delete("/delete-shop/{shop_id}")
async def delete_shop(shop_id: str, current_user: UserOut = Depends(get_current_merchant)):
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")

    if shop["owner_id"] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Accès refusé")

    await shops.delete_one({"_id": ObjectId(shop_id)})
    return {"message": "Boutique supprimée"}


@router.patch("/publish/{shop_id}")
async def publish_shop(shop_id: str, current_user: UserOut = Depends(get_current_merchant)):
    # Votre logique de publication ici
    pass

@router.patch("/unpublish/{shop_id}")
async def unpublish_shop(shop_id: str, current_user: UserOut = Depends(get_current_merchant)):
    # Votre logique de dépublication ici
    pass