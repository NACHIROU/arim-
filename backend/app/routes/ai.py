import os
from fastapi import APIRouter, HTTPException
import google.generativeai as genai

from app.schemas.ai import GenerationRequest

# Configuration du client Google AI avec votre clé
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")
router = APIRouter()


@router.post("/generate-description", response_model=dict)
async def generate_description(request: GenerationRequest):
    if not request.name:
        raise HTTPException(status_code=400, detail="Le nom ne peut pas être vide.")

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Impossible d'initialiser le modèle d'IA: {e}"
        )

    # --- NOUVELLE LOGIQUE DE PROMPT ---

    # On construit la base du contexte
    base_prompt = f"Pour un(e) {request.target_type} nommé(e) '{request.name}'"
    if request.category and request.category != "Tous":
        base_prompt += f" dans la catégorie '{request.category}'"
    if request.location and request.location != "Toutes les villes":
        base_prompt += f" situé(e) à {request.location}"

    # On adapte l'instruction finale
    if request.description and len(request.description.strip()) > 10:
        # Si une description existe déjà, on demande à l'IA de l'améliorer
        prompt = f"{base_prompt}, améliore et reformule le texte suivant pour en faire une description commerciale plus attrayante (2-3 phrases) : '{request.description}'. Adopte un ton accueillant et local."
    else:
        # Sinon, on lui demande de créer une description de zéro
        prompt = f"{base_prompt}, rédige une description commerciale courte (2-3 phrases). Met en avant un bénéfice client clair et adopte un ton accueillant et local."

    try:
        response = await model.generate_content_async(prompt)
        return {"description": response.text}
    except Exception as e:
        print(f"Erreur API Google: {e}")
        raise HTTPException(
            status_code=500, detail="Le service de génération de texte a échoué."
        )
