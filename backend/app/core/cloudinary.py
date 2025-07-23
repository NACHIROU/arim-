import cloudinary
from cloudinary.uploader import upload
from fastapi import HTTPException, UploadFile
from dotenv import load_dotenv
import os
import io

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


async def upload_images_to_cloudinary(images: list[UploadFile]) -> list[str]:
    urls = []
    for image in images:
        contents = await image.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Fichier vide")
        file_like = io.BytesIO(contents)
        file_like.name = image.filename
        file_like.seek(0)
        try:
            result = upload(file=file_like, folder="shops/", resource_type="auto")
            urls.append(result["secure_url"])
        except Exception as e:
            print(f"Erreur Cloudinary: {e}")
            raise HTTPException(
                status_code=500, detail=f"Erreur lors de l'upload des images: {e}"
            )
    return urls
