from pydantic import BaseModel, Field
from typing import List, Literal

# --- Sub-models for Recipe Details ---

class RecipeStepDTO(BaseModel):
    step: int = Field(..., description="The sequential step number", example=1)
    text: str = Field(..., description="The cooking or preparation instruction", example="Whisk 3 egg whites until fluffy.")

class MealItemDTO(BaseModel):
    type: Literal["breakfast", "lunch", "dinner"] = Field(..., description="The intended meal slot")
    food_name: str = Field(..., description="Name of the meal option", example="Spinach & Avocado Egg White Omelet")
    calories: int = Field(..., description="Caloric value of the single meal portion", example=340)
    benefits: str = Field(..., description="Brief summary statement of clinical or physical benefits", example="Rich in folate and healthy fats to support neural growth.")
    prep_time: str = Field(..., description="Estimated time required to prepare the meal", example="15 mins")
    ingredients: List[str] = Field(..., description="List of raw ingredients needed", example=["3 Egg whites", "1 cup Spinach", "1/2 Avocado"])
    recipe_steps: List[RecipeStepDTO] = Field(..., description="Ordered list of preparation instructions")


# --- Main Request / Response DTOs ---

class DietPlanRequestDTO(BaseModel):
    user_expression: str = Field(
        ..., 
        description="The user's raw text indicating their current pregnancy cravings, physical symptoms, or general food vibes.",
        example="Feeling heavily nauseous but craving something savory with spinach."
    )

class DietPlanApiResponseDTO(BaseModel):
    total_calories: int = Field(..., description="Aggregated caloric content across all meals in the day menu", example=1650)
    safety_verdict: Literal["safe", "caution"] = Field(..., description="Maternal risk score assessment for overall menu profiles")
    dietary_breakdown: str = Field(..., description="A short textual micro-macro summary matching your layout breakdown tracker", example="High fiber, moderate proteins, balanced low-sodium index.")
    safety_notes: str = Field(..., description="The contextual alert note displayed at the bottom of the active recipe guide card", example="Ensure eggs are completely cooked to solid form to avoid salmonella risks.")
    generated_menu: List[MealItemDTO] = Field(
        ..., 
        description="The verified menu package containing exactly one option for breakfast, lunch, and dinner."
    )