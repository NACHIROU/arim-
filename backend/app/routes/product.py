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
    shop_id: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    images: List[UploadFile] = File(...),
    current_user: UserOut = Depends(get_current_merchant)
):
    # 1. Vérifier que la boutique appartient bien au marchand (sécurité)
    shop = await shops.find_one({"_id": ObjectId(shop_id), "owner_id": ObjectId(current_user.id)})
    if not shop:
        raise HTTPException(status_code=403, detail="Action non autorisée sur cette boutique.")

    # 2. Gérer les images
    image_urls = await upload_images_to_cloudinary(images)
    if not image_urls:
        raise HTTPException(status_code=500, detail="Erreur lors du téléversement des images.")

    # 3. Créer le document produit
    product_data = {
        "name": name, "description": description, "price": price,
        "images": image_urls, "shop_id": ObjectId(shop_id)
    }
    result = await products.insert_one(product_data)
    created_product = await products.find_one({"_id": result.inserted_id})

    # --- CORRECTION : Enrichir le produit avant de le renvoyer ---
    created_product["shop"] = {
        "_id": shop.get("_id"),
        "name": shop.get("name"),
        "contact_phone": shop.get("contact_phone")
    }

    # Conversion manuelle des IDs
    created_product["_id"] = str(created_product["_id"])
    created_product["shop_id"] = str(created_product["shop_id"])
    created_product["shop"]["_id"] = str(created_product["shop"]["_id"])

    return ProductOut.model_validate(created_product)
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

    return {"message": "Produit supprimé avec Succès ✅ "}

# ===============================================================
# == Routes Publiques (pour les visiteurs du site)
# ===============================================================


@router.get("/{shop_id}/products/", response_model=List[ProductWithShopInfo])
async def get_public_products_by_shop(shop_id: str):
    """
    Récupère les produits d'une boutique, en s'assurant que la boutique
    est visible et que chaque produit est enrichi avec les infos complètes de sa boutique.
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID de boutique invalide")

    # 1. On valide que la boutique parente est bien visible par le public
    validation_pipeline = [
        {"$match": {"_id": ObjectId(shop_id), "is_published": True}},
        {"$lookup": {"from": "users", "localField": "owner_id", "foreignField": "_id", "as": "owner_details"}},
        {"$unwind": "$owner_details"},
        {"$match": {"owner_details.is_active": True}}
    ]
    valid_shop_list = await shops.aggregate(validation_pipeline).to_list(length=1)
    if not valid_shop_list:
        raise HTTPException(status_code=404, detail="Boutique non trouvée, non publiée, ou propriétaire inactif.")
    
    shop_data = valid_shop_list[0]
    
    # 2. Si la boutique est valide, on récupère ses produits
    products_cursor = products.find({"shop_id": ObjectId(shop_id)})
    
    # 3. On enrichit chaque produit avec les infos de la boutique avant de le renvoyer
    product_list = []
    async for product in products_cursor:
        product_info = {
            **product,
            "shop": {
                "_id": shop_data.get("_id"),
                "name": shop_data.get("name"),
                "contact_phone": shop_data.get("contact_phone")
            }
        }
        product_list.append(ProductWithShopInfo.model_validate(product_info))
        
    return product_list


@router.get("/{product_id}", response_model=ProductWithShopInfo)
async def get_public_product_by_id(product_id: str):
    """
    Récupère un seul produit, en vérifiant que sa boutique
    est publiée ET que son marchand est actif.
    """
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID du produit invalide")

    pipeline = [
        {"$match": {"_id": object_id}},
        {"$lookup": {"from": "shops", "localField": "shop_id", "foreignField": "_id", "as": "shop_details"}},
        {"$unwind": "$shop_details"},
        {"$match": {"shop_details.is_published": True}},
        
        # --- On ajoute la vérification du statut du marchand ---
        {"$lookup": {"from": "users", "localField": "shop_details.owner_id", "foreignField": "_id", "as": "owner_details"}},
        {"$unwind": "$owner_details"},
        {"$match": {"owner_details.is_active": True}},
        
        # Le $project reste le même
        {"$project": {
                "_id": 1, "name": 1, "description": 1, "price": 1,
                "images": 1, "shop_id": 1,
                "seller": "$owner_details.first_name",
                "shop": {"_id": "$shop_details._id", "name": "$shop_details.name", "contact_phone": "$shop_details.contact_phone"}
            }
        }
    ]
    
    result_list = await products.aggregate(pipeline).to_list(length=1)
    if not result_list:
        raise HTTPException(status_code=404, detail="Produit non trouvé, non publié, ou son vendeur est inactif")
        
    return result_list[0]

@router.get("/public-products/", response_model=List[ProductWithShopInfo])
async def get_public_products():
    """
    Récupère tous les produits publics, enrichis avec les informations de leur boutique.
    Un produit est public si sa boutique est publiée ET si son propriétaire est actif.
    """
    pipeline = [
        # Étape 1 : Joindre les informations de la boutique
        {"$lookup": {
            "from": "shops",
            "localField": "shop_id",
            "foreignField": "_id",
            "as": "shop_details"
        }},
        {"$unwind": "$shop_details"},
        
        # Étape 2 : Joindre les informations du propriétaire de la boutique
        {"$lookup": {
            "from": "users",
            "localField": "shop_details.owner_id",
            "foreignField": "_id",
            "as": "owner_details"
        }},
        {"$unwind": "$owner_details"},

        # Étape 3 : Filtrer pour ne garder que les produits valides
        {"$match": {
            "shop_details.is_published": True,
            "owner_details.is_active": True
        }},

        # Étape 4 : Projeter la forme finale de la donnée
        {
            "$project": {
                "_id": 1,
                "name": 1,
                "description": 1,
                "price": 1,
                "images": 1,
                "shop_id": 1,
                "shop": {
                    "_id": "$shop_details._id",
                    "name": "$shop_details.name",
                    "contact_phone": "$shop_details.contact_phone"
                }
            }
        },
        {"$limit": 50}
    ]
    
    product_list_from_db = await products.aggregate(pipeline).to_list(length=None)
    
    # Conversion manuelle des IDs pour la validation Pydantic
    for p in product_list_from_db:
        p["_id"] = str(p["_id"])
        p["shop_id"] = str(p["shop_id"])
        if p.get("shop"):
            p["shop"]["_id"] = str(p["shop"]["_id"])

    return [ProductWithShopInfo.model_validate(p) for p in product_list_from_db]