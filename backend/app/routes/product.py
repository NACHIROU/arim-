from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List

from app.core.cloudinary import upload_images_to_cloudinary
from app.core.dependencies import get_current_merchant
from app.db.database import products, shops
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate, ProductWithShopInfo
from app.models.product import Product

router = APIRouter()



@router.post("/create-products/", response_model=ProductOut)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    shop_id: str = Form(...),
    image: UploadFile = File(...),
):
    image_urls = await upload_images_to_cloudinary([image])
    image_url = image_urls[0] if image_urls else ""

    # Vérifier shop_id valide
    try:
        shop_object_id = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shop_id format")

    product = Product(
        name=name,
        description=description,
        price=price,
        image_url=image_url,
        shop_id=shop_object_id,
    )

    result = await products.insert_one(product.to_mongo())
    product.id = result.inserted_id

    return ProductOut.from_mongo(product.to_mongo())

@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product_by_id(product_id: str):
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product_id format")

    product = await products.find_one({"_id": object_id})

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Transformation pour respecter ProductOut
    product["id"] = str(product["_id"])
    del product["_id"]

    return product


@router.put("/update-products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    name: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    image: UploadFile = File(None),
    current_user=Depends(get_current_merchant),
):
    try:
        object_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product_id")

    update_data = {}

    if name:
        update_data["name"] = name
    if description:
        update_data["description"] = description
    if price is not None:
        update_data["price"] = price
    if image:
        image_urls = await upload_images_to_cloudinary([image])
        if image_urls:
            update_data["image_url"] = image_urls[0]

    result = await products.update_one({"_id": object_id}, {"$set": update_data})

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or no changes")

    updated_product = await products.find_one({"_id": object_id})
    return ProductOut.from_mongo(updated_product)



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