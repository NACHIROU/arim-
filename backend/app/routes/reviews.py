from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId

from app.db.database import reviews # Assurez-vous d'avoir une collection 'reviews'
from app.schemas.review import ReviewCreate, ReviewOut, ReviewWithShopInfo
from app.schemas.users import UserOut
# Cette dépendance doit pouvoir récupérer n'importe quel utilisateur connecté
from app.core.dependencies import get_current_user 

router = APIRouter()

@router.post("/", response_model=ReviewOut)
async def create_review(
    review_data: ReviewCreate,
    current_user: UserOut = Depends(get_current_user)
):
    """
    Permet à un utilisateur connecté de laisser un avis sur une boutique.
    """
    # On pourrait ajouter une vérification de rôle si nécessaire
    # if current_user.role != 'client':
    #     raise HTTPException(status_code=403, detail="Seuls les clients peuvent laisser un avis.")

    # On vérifie si l'utilisateur n'a pas déjà laissé un avis sur cette boutique
    existing_review = await reviews.find_one({
        "shop_id": ObjectId(review_data.shop_id),
        "user_id": ObjectId(current_user.id)
    })
    if existing_review:
        raise HTTPException(status_code=400, detail="Vous avez déjà laissé un avis sur cette boutique.")

    new_review = {
        "shop_id": ObjectId(review_data.shop_id),
        "user_id": ObjectId(current_user.id),
        "author_name": current_user.first_name, # On utilise le nom de l'utilisateur connecté
        "rating": review_data.rating,
        "message": review_data.message,
        "created_at": datetime.utcnow()
    }

    result = await reviews.insert_one(new_review)
    created_review = await reviews.find_one({"_id": result.inserted_id})

    return ReviewOut(**created_review)


@router.get("/shop/{shop_id}", response_model=List[ReviewOut])
async def get_reviews_for_shop(shop_id: str):
    """
    Route publique pour récupérer tous les avis d'une boutique spécifique.
    """
    if not ObjectId.is_valid(shop_id):
        raise HTTPException(status_code=400, detail="ID de la boutique invalide")

    # On trie par date pour afficher les plus récents en premier
    cursor = reviews.find({"shop_id": ObjectId(shop_id)}).sort("created_at", -1)
    
    review_list = await cursor.to_list(length=100) # On limite à 100 avis pour la performance

    return [ReviewOut(**review) for review in review_list]

@router.get("/my-reviews", response_model=List[ReviewWithShopInfo])
async def get_my_reviews(current_user: UserOut = Depends(get_current_user)):
    """
    Récupère les avis de l'utilisateur connecté, enrichis avec les infos de la boutique.
    """
    pipeline = [
        # 1. On trouve les avis de l'utilisateur
        {"$match": {"user_id": ObjectId(current_user.id)}},
        # 2. On joint les informations de la boutique correspondante
        {"$lookup": {
            "from": "shops",
            "localField": "shop_id",
            "foreignField": "_id",
            "as": "shop_details"
        }},
        {"$unwind": "$shop_details"},
        # 3. On trie par date
        {"$sort": {"created_at": -1}}
    ]
    
    user_reviews = await reviews.aggregate(pipeline).to_list(length=None)
    return [ReviewWithShopInfo.model_validate(review) for review in user_reviews]


@router.delete("/{review_id}", response_model=dict)
async def delete_review(review_id: str, current_user: UserOut = Depends(get_current_user)):
    """
    Permet à un utilisateur de supprimer son propre avis.
    """
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="ID d'avis invalide")

    review_to_delete = await reviews.find_one({"_id": ObjectId(review_id)})
    if not review_to_delete:
        raise HTTPException(status_code=404, detail="Avis non trouvé")

    # Sécurité : on vérifie que l'utilisateur est bien le propriétaire de l'avis
    if review_to_delete["user_id"] != ObjectId(current_user.id):
        raise HTTPException(status_code=403, detail="Action non autorisée")

    await reviews.delete_one({"_id": ObjectId(review_id)})
    return {"message": "Avis supprimé avec Succès ✅ ."}