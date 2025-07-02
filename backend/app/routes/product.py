from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List

from app.core.cloudinary import upload_images_to_cloudinary
from app.core.dependencies import get_current_merchant
from app.db.database import products, shops
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate, ProductWithShopInfo
from app.models.product import Product
from app.schemas.users import UserOut

router = APIRouter()



# Dans votre fichier app/routes/product.py

@router.post("/create-products/", response_model=ProductOut)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    shop_id: str = Form(...),
    image: UploadFile = File(...),
    # Vous pourriez aussi avoir besoin de `current_user` pour vérifier la propriété de la boutique
    # current_user: UserOut = Depends(get_current_merchant) 
):
    # 1. Gérer l'image
    image_urls = await upload_images_to_cloudinary([image])
    if not image_urls:
        raise HTTPException(status_code=500, detail="Image upload failed")
    image_url = image_urls[0]

    # 2. Préparer les données du produit dans un dictionnaire
    try:
        product_data = {
            "name": name,
            "description": description,
            "price": price,
            "image_url": image_url,
            "shop_id": ObjectId(shop_id),
        }
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shop_id format")

    # 3. Insérer le dictionnaire dans la base de données
    result = await products.insert_one(product_data)
    
    # 4. Récupérer le document fraîchement créé pour avoir une donnée complète
    created_product = await products.find_one({"_id": result.inserted_id})

    if not created_product:
        raise HTTPException(status_code=500, detail="Failed to retrieve product after creation.")

    # 5. Créer et retourner la réponse Pydantic (correction du bug)
    return ProductOut(**created_product)

@router.get("/{product_id}", response_model=ProductOut)
async def get_product_by_id(product_id: str):
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product_id format")

    product = await products.find_one({"_id": object_id})

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product["id"] = str(product["_id"])
    product["shop_id"] = str(product["shop_id"])
    del product["_id"]

    return product


@router.put("/update-products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    name: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    image: UploadFile = File(None),
    current_user: UserOut = Depends(get_current_merchant), # J'ai ajouté le type UserOut
):
    # Vérification de la validité de l'ID
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product_id format")

    # Vérification que le produit existe et appartient bien au marchand
    product_to_update = await products.find_one({"_id": object_id})
    if not product_to_update:
        raise HTTPException(status_code=404, detail="Product not found")

    shop_of_product = await shops.find_one({"_id": product_to_update['shop_id']})
    if not shop_of_product or shop_of_product['owner_id'] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this product")

    # Préparation des données à mettre à jour
    update_data = {}
    if name is not None: update_data["name"] = name
    if description is not None: update_data["description"] = description
    if price is not None: update_data["price"] = price
    
    # Gestion de la nouvelle image si elle est fournie
    if image:
        image_urls = await upload_images_to_cloudinary([image])
        if image_urls:
            update_data["image_url"] = image_urls[0]

    # Mettre à jour seulement si des données ont été fournies
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    result = await products.update_one({"_id": object_id}, {"$set": update_data})

    # Pas besoin de vérifier modified_count, si le produit est trouvé, on renvoie la nouvelle version
    updated_product = await products.find_one({"_id": object_id})
    
    # --- CORRECTION DU BUG PRINCIPAL ---
    return ProductOut(**updated_product)


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user=Depends(get_current_merchant)):
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product_id")

    result = await products.delete_one({"_id": object_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted successfully"}


@router.get("/get-all-products/", response_model=List[ProductWithShopInfo])
async def get_all_products():
    """
    Récupère tous les produits et les enrichit avec les informations de leur boutique.
    """
    # ... (le reste de votre fonction reste exactement le même)
    all_products = []
    products_cursor = products.find({})

    async for product in products_cursor:
        shop = None
        if "shop_id" in product and product["shop_id"]:
            shop = await shops.find_one({"_id": product["shop_id"]})

        product_response = {
            "id": str(product["_id"]),
            "name": product["name"],
            "description": product["description"],
            "price": product["price"],
            "image_url": product["image_url"],
            "shop_id": str(product["shop_id"]),
            "seller": shop["name"] if shop else "Vendeur inconnu",
            "shop": {
                "id": str(shop["_id"]),
                "name": shop["name"]
            } if shop else None
        }
        all_products.append(product_response)

    return all_products