import httpx
from bson import ObjectId
from fastapi import APIRouter, Form, File, HTTPException, UploadFile, Depends
from typing import List, Optional

from app.db.database import products, shops
from app.core.cloudinary import upload_images_to_cloudinary
from app.core.dependencies import get_current_merchant
from app.schemas.shop import ShopOut, ShopBase
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
        "is_published": False # Une nouvelle boutique est un brouillon par défaut
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
async def update_shop(shop_id: str, updated_data: ShopBase, current_user: UserOut = Depends(get_current_merchant)):
    if not ObjectId.is_valid(shop_id): raise HTTPException(status_code=400, detail="ID invalide")
    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop or shop["owner_id"] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Accès refusé ou boutique non trouvée")
    update_payload = updated_data.dict(exclude_unset=True)
    await shops.update_one({"_id": ObjectId(shop_id)}, {"$set": update_payload})
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

# ===============================================================
# == Routes Publiques (pour les visiteurs du site)
# ===============================================================

@router.get("/public-shops/", response_model=List[ShopOut])
async def get_public_shops():
    cursor = shops.find({"is_published": True})
    return [ShopOut(**shop) async for shop in cursor]

@router.get("/retrieve-shop/{shop_id}", response_model=ShopOut)
async def retrieve_public_shop(shop_id: str):
    if not ObjectId.is_valid(shop_id): raise HTTPException(status_code=400, detail="ID invalide")
    shop = await shops.find_one({"_id": ObjectId(shop_id), "is_published": True})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée ou non publiée")
    return ShopOut(**shop)

@router.get("/{shop_id}/products/", response_model=List[ProductOut])
async def get_public_products_by_shop(shop_id: str):
    if not ObjectId.is_valid(shop_id): raise HTTPException(status_code=400, detail="ID invalide")
    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée ou non publiée")
    cursor = products.find({"shop_id": ObjectId(shop_id)})
    return [ProductOut(**product) async for product in cursor]