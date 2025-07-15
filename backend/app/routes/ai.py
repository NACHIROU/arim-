import os
from fastapi import APIRouter, HTTPException
import google.generativeai as genai

from app.schemas.ai import GenerationRequest

# Configuration du client Google AI avec votre clé
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')
router = APIRouter()


@router.post("/generate-description", response_model=dict)
async def generate_description(request: GenerationRequest):
    # La logique de la fonction reste exactement la même
    if not request.name:
        raise HTTPException(status_code=400, detail="Le nom ne peut pas être vide.")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Impossible d'initialiser le modèle d'IA: {e}")


    prompt = f"Rédige une description commerciale de 2 à 3 phrases pour une {request.target_type} nommée '{request.name}'."
    if request.category and request.category != "Tous":
        prompt += f" Elle est dans la catégorie '{request.category}'."
    if request.location and request.location != "Toutes les villes":
        prompt += f" Elle est située à {request.location}."
    prompt += " Adopte un ton accueillant et local."

    try:
        response = model.generate_content(prompt)
        return {"description": response.text}
    except Exception as e:
        print(f"Erreur API Google: {e}")
        raise HTTPException(status_code=500, detail="Le service de génération de texte a échoué.")
