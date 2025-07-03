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
    image: UploadFile = File(...),
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
    image_urls = await upload_images_to_cloudinary([image])
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
        "image_url": final_image_url, # <-- On assigne ici la VRAIE URL
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
    image: UploadFile = File(None),
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
    if image:
        image_urls = await upload_images_to_cloudinary([image])
        if image_urls: update_data["image_url"] = image_urls[0]

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
    """
    Récupère tous les produits appartenant à des boutiques publiées,
    en y ajoutant les informations sur la boutique ET le vendeur.
    """
    pipeline = [
        {"$lookup": {"from": "shops", "localField": "shop_id", "foreignField": "_id", "as": "shop_details"}},
        {"$unwind": "$shop_details"},
        {"$match": {"shop_details.is_published": True}},
        {"$lookup": {"from": "users", "localField": "shop_details.owner_id", "foreignField": "_id", "as": "owner_details"}},
        {"$unwind": {"path": "$owner_details", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1, "name": 1, "description": 1, "price": 1, "image_url": 1, "shop_id": 1,
                "seller": {"$ifNull": ["$owner_details.first_name", "Vendeur inconnu"]},
                "shop": {"_id": "$shop_details._id", "name": "$shop_details.name"}
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
    Enrichit la réponse avec les informations du vendeur et de la boutique.
    """
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID du produit invalide")

    # On utilise une agrégation pour récupérer toutes les infos d'un coup
    pipeline = [
        # Étape 1 : Trouver le produit par son ID
        {"$match": {"_id": object_id}},
        
        # Étape 2 : Joindre les informations de la boutique
        {"$lookup": {"from": "shops", "localField": "shop_id", "foreignField": "_id", "as": "shop_details"}},
        {"$unwind": "$shop_details"},
        
        # Étape 3 : S'assurer que la boutique est bien publiée
        {"$match": {"shop_details.is_published": True}},
        
        # Étape 4 : Joindre les informations du vendeur
        {"$lookup": {"from": "users", "localField": "shop_details.owner_id", "foreignField": "_id", "as": "owner_details"}},
        {"$unwind": {"path": "$owner_details", "preserveNullAndEmptyArrays": True}}
    ]
    
    result_list = await products.aggregate(pipeline).to_list(length=1)
    if not result_list:
        raise HTTPException(status_code=404, detail="Produit non trouvé ou non publié")
    
    # On met en forme le résultat pour qu'il corresponde au schéma
    p = result_list[0]
    shop_data = p.get("shop_details", {})
    owner_data = p.get("owner_details", {})
    
    product_info = {
        "id": str(p.get("_id")),
        "name": p.get("name"),
        "description": p.get("description"),
        "price": p.get("price"),
        "image_url": p.get("image_url"),
        "shop_id": str(p.get("shop_id")),
        "seller": owner_data.get("first_name", "Vendeur inconnu"), 
        "shop": {
            "_id": str(shop_data.get("_id")),
            "name": shop_data.get("name")
        }
    }
    return ProductWithShopInfo.model_validate(product_info)