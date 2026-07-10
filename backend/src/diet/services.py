from fastapi import HTTPException, status 
from src.diet.dtos import DietPlanApiResponseDTO
from src.utils.settings import settings  
from google import genai

# Initialize the Gemini client using the official google-genai SDK layout
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_diet_plan(user_expression: str) -> DietPlanApiResponseDTO:
    """
    Generates a personalized, pregnancy-safe 3-meal day plan (breakfast, lunch, dinner)
    based on the user's specific cravings, emotional state, or physical symptoms.
    """
    try:
        # Construct a clear, structured systemic instruction prompt
        prompt = f"""
        You are an expert maternal nutritionist and pregnancy-safe culinary chef. 
        The user has expressed the following food cravings, symptoms, or current mood:
        "{user_expression}"

        Generate a complete, single-day meal plan tailored to this expression containing exactly 3 meals: 
        1. breakfast
        2. lunch
        3. dinner

        Guidelines for the generation:
        - Ensure all meals are completely safe for pregnancy (e.g., no raw eggs, no unpasteurized dairy, no high-mercury fish, cooked to temperature).
        - Explicitly target or alleviate their mood/symptoms if possible (e.g., ginger/peppermint elements or light, non-greasy foods if they mention nausea or morning sickness).
        - Provide brief, actionable, multi-step instructions for the recipe steps.
        - Calculate a realistic caloric distribution for the meals.
        - Set 'safety_verdict' to 'safe' unless a specific component requires explicit prep warnings, in which case set it to 'caution'.
        """

        # Call Gemini using the correct SDK pattern matching your scanner implementation
        interaction = gemini_client.models.generate_content(
            model="gemini-2.5-flash",  # Using the optimal, fast multimodal model
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": DietPlanApiResponseDTO,
            },
        )
        
        # Access the auto-parsed Pydantic response safely
        gemini_response = interaction.parsed
        
        if not gemini_response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini failed to compile a structured meal plan response."
            )
            
        return gemini_response

    except Exception as e:
        # Fallback error handling wrapper
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate meal plan: {str(e)}"
        )