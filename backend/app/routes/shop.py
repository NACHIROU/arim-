from bson import ObjectId
from fastapi import APIRouter, Form, File, HTTPException, UploadFile, Depends

from app.core.cloudinary import upload_images_to_cloudinary
from app.core.dependencies import get_current_merchant
from app.db.database import shops
from app.schemas.shop import ShopOut, ShopBase
from app.schemas.users import UserOut

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
        "owner_id": current_user.id
    }

    new_shop = await shops.insert_one(shop_data)
    created_shop = await shops.find_one({"_id": new_shop.inserted_id})

    # Transformation pour correspondre à ShopOut
    created_shop["id"] = str(created_shop["_id"])
    del created_shop["_id"]

    return created_shop


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


