from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List

from app.core.cloudinary import upload_images_to_cloudinary
from app.core.dependencies import get_current_merchant
from app.db.database import products, shops
from app.schemas.product import ProductOut, ProductWithShopInfo
from app.schemas.users import UserOut

router = APIRouter()

# ===============================================================
# == Routes Sécurisées (pour le Dashboard du Marchand)
# ===============================================================

@router.post("/create-products/", response_model=ProductOut)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    shop_id: str = Form(...),
    images: List[UploadFile] = File(...),
    current_user: UserOut = Depends(get_current_merchant)
):
    # Vérification que le marchand est propriétaire de la boutique
    try:
        shop_object_id = ObjectId(shop_id)
        shop = await shops.find_one({"_id": shop_object_id})
        if not shop or shop["owner_id"] != ObjectId(current_user.id):
            raise HTTPException(status_code=403, detail="Opération non autorisée sur cette boutique")
    except Exception:
        raise HTTPException(status_code=400, detail="ID de la boutique invalide")

    # 1. On récupère la VRAIE URL de l'image depuis Cloudinary
    image_urls = await upload_images_to_cloudinary(images)
    if not image_urls:
        raise HTTPException(status_code=500, detail="Échec du téléversement de l'image")
    
    # On stocke cette URL dans une variable
    final_image_url = image_urls[0]

    # 2. On prépare les données à insérer
    product_data = {
        "name": name,
        "description": description,
        "price": price,
        "shop_id": shop_object_id,
        "images": image_urls, # <-- On assigne ici la VRAIE URL
    }

    # 3. On insère en base de données
    result = await products.insert_one(product_data)
    created_product = await products.find_one({"_id": result.inserted_id})
    if not created_product:
        raise HTTPException(status_code=500, detail="Échec de la récupération du produit.")

    return ProductOut(**created_product)

@router.put("/update-products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    name: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    images: List[UploadFile] = File(...),
    current_user: UserOut = Depends(get_current_merchant),
):
    # La logique de cette fonction était déjà correcte et sécurisée.
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID du produit invalide")

    product_to_update = await products.find_one({"_id": object_id})
    if not product_to_update:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    shop_of_product = await shops.find_one({"_id": product_to_update['shop_id']})
    if not shop_of_product or shop_of_product['owner_id'] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Action non autorisée")

    update_data = {}
    if name is not None: update_data["name"] = name
    if description is not None: update_data["description"] = description
    if price is not None: update_data["price"] = price
    if images:
        image_urls = await upload_images_to_cloudinary(images)
        if image_urls:
            update_data["images"] = image_urls
        else:
            raise HTTPException(status_code=500, detail="Échec du téléversement de l'image")

    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")

    await products.update_one({"_id": object_id}, {"$set": update_data})
    updated_product = await products.find_one({"_id": object_id})
    return ProductOut(**updated_product)

@router.delete("/products/{product_id}", response_model=dict)
async def delete_product(product_id: str, current_user: UserOut = Depends(get_current_merchant)):
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID du produit invalide")

    # --- AJOUT : Vérification de sécurité ---
    product_to_delete = await products.find_one({"_id": object_id})
    if not product_to_delete:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    shop = await shops.find_one({"_id": product_to_delete['shop_id']})
    if not shop or shop['owner_id'] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Action non autorisée")

    result = await products.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produit non trouvé lors de la suppression")

    return {"message": "Produit supprimé avec succès"}

# ===============================================================
# == Routes Publiques (pour les visiteurs du site)
# ===============================================================

@router.get("/public-products/", response_model=List[ProductWithShopInfo])
async def get_public_products():
    pipeline = [
        {"$lookup": {"from": "shops", "localField": "shop_id", "foreignField": "_id", "as": "shop_details"}},
        {"$unwind": "$shop_details"},
        {"$match": {"shop_details.is_published": True}},
        {"$lookup": {"from": "users", "localField": "shop_details.owner_id", "foreignField": "_id", "as": "owner_details"}},
        {"$unwind": {"path": "$owner_details", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1, "name": 1, "description": 1, "price": 1,
                "images": 1, # <-- On s'assure d'inclure le tableau d'images
                "shop_id": 1,
                "seller": {"$ifNull": ["$owner_details.first_name", "Vendeur inconnu"]},
                "shop": {"_id": "$shop_details._id", "name": "$shop_details.name", "contact_phone": "$shop_details.contact_phone"}
            }
        },
        {"$limit": 50}
    ]
    product_list = [ProductWithShopInfo.model_validate(p) async for p in products.aggregate(pipeline)]
    return product_list



@router.get("/{product_id}", response_model=ProductWithShopInfo)
async def get_public_product_by_id(product_id: str):
    """
    Récupère un seul produit par son ID, uniquement si sa boutique est publiée.
    Enrichit la réponse avec les informations complètes du vendeur et de la boutique.
    """
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID du produit invalide")

    pipeline = [
        {"$match": {"_id": ObjectId(product_id)}},
        {"$lookup": {"from": "shops", "localField": "shop_id", "foreignField": "_id", "as": "shop_details"}},
        {"$unwind": "$shop_details"},
        {"$match": {"shop_details.is_published": True}},
        {"$lookup": {"from": "users", "localField": "shop_details.owner_id", "foreignField": "_id", "as": "owner_details"}},
        {"$unwind": {"path": "$owner_details", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1, "name": 1, "description": 1, "price": 1,
                "images": 1, # <-- On s'assure d'inclure le tableau d'images
                "shop_id": 1,
                "seller": {"$ifNull": ["$owner_details.first_name", "Vendeur inconnu"]},
                "shop": {"_id": "$shop_details._id", "name": "$shop_details.name", "contact_phone": "$shop_details.contact_phone"}
            }
        }
    ]
    
    result_list = await products.aggregate(pipeline).to_list(length=1)
    if not result_list:
        raise HTTPException(status_code=404, detail="Produit non trouvé ou non publié")
        
    return result_list[0]

