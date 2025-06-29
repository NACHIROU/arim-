from bson import ObjectId
from fastapi import APIRouter, Form, File, HTTPException, UploadFile, Depends
from app.db.database import products
from app.core.cloudinary import upload_images_to_cloudinary
from app.core.dependencies import get_current_merchant
from app.db.database import shops
from app.schemas.shop import ShopOut, ShopBase
from app.schemas.users import UserOut
from app.schemas.product import ProductOut

router = APIRouter()



@router.post("/create-shop/", response_model=ShopOut)
async def create_shop(
    name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    images: list[UploadFile] = File(...),
    current_user: UserOut = Depends(get_current_merchant)
):
    image_urls = await upload_images_to_cloudinary(images)

    shop_data = {
        "name": name,
        "description": description,
        "location": location,
        "images": image_urls,
        "owner_id": ObjectId(current_user.id) # Il est bon de s'assurer que c'est un ObjectId si votre base est cohérente
    }

    new_shop_result = await shops.insert_one(shop_data)
    created_shop_from_db = await shops.find_one({"_id": new_shop_result.inserted_id})

    if not created_shop_from_db:
        raise HTTPException(status_code=500, detail="Erreur : la boutique a été créée mais n'a pas pu être récupérée.")


    shop_to_return = {
        "id": str(created_shop_from_db["_id"]),
        "name": created_shop_from_db["name"],
        "description": created_shop_from_db["description"],
        "location": created_shop_from_db["location"],
        "images": created_shop_from_db.get("images", []), # .get est plus sûr
        
        # La ligne cruciale : on inclut owner_id et on le convertit en string
        "owner_id": str(created_shop_from_db["owner_id"])
    }

    return shop_to_return


@router.get("/retrieve-all-shops/", response_model=list[ShopOut])
async def retrieve_all_shops():
    shop_list = []
    async for shop in shops.find():
        shop["id"] = str(shop["_id"])
        del shop["_id"]
        # Ajoute une valeur par défaut si owner_id absent
        if "owner_id" not in shop:
            shop["owner_id"] = ""
        shop_list.append(shop)
    return shop_list


@router.get("/retrieve-shop/{shop_id}", response_model=ShopOut)
async def retrieve_shop(shop_id: str):
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")

    shop["id"] = str(shop["_id"])
    del shop["_id"]
    return shop

@router.get("/{shop_id}/products/", response_model=list[ProductOut])
async def get_products_by_shop(shop_id: str):
    """
    Récupérer les produits d'une boutique spécifique.
    """
    try:
        shop_object_id = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shop_id format")

    shop_products = []
    cursor = products.find({"shop_id": shop_object_id})
    async for product in cursor:
        product["id"] = str(product["_id"])
        product["shop_id"] = str(product["shop_id"])
        del product["_id"]
        shop_products.append(product)

    return shop_products

@router.put("/update-shop/{shop_id}", response_model=ShopOut)
async def update_shop(shop_id: str, updated_data: ShopBase, current_user: dict = Depends(get_current_merchant)):
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")

    if shop["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    await shops.update_one(
        {"_id": ObjectId(shop_id)},
        {"$set": updated_data.dict(exclude_unset=True)}
    )

    updated_shop = await shops.find_one({"_id": ObjectId(shop_id)})
    updated_shop["id"] = str(updated_shop["_id"])
    del updated_shop["_id"]
    return updated_shop


@router.delete("/delete-shop/{shop_id}")
async def delete_shop(shop_id: str, current_user: dict = Depends(get_current_merchant)):
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    shop = await shops.find_one({"_id": ObjectId(shop_id)})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")

    if shop["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    await shops.delete_one({"_id": ObjectId(shop_id)})
    return {"message": "Boutique supprimée"}

@router.patch("/publish/{shop_id}")
async def publish_shop(shop_id: str):
    try:
        shop_object_id = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shop_id format")

    result = await shops.update_one(
        {"_id": shop_object_id},
        {"$set": {"is_published": True}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Boutique non trouvée ou déjà publiée")

    return {"message": "Boutique publiée avec succès"}

@router.patch("/unpublish/{shop_id}")
async def unpublish_shop(shop_id: str):
    try:
        shop_object_id = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shop_id format")

    result = await shops.update_one(
        {"_id": shop_object_id},
        {"$set": {"is_published": False}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Boutique non trouvée ou déjà non publiée")

    return {"message": "Boutique dépubliée avec succès"}
