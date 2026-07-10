from fastapi import APIRouter
from src.diet import services
from src.diet.dtos import DietPlanRequestDTO

router = APIRouter()

@router.post("/diet-plan")
async def get_diet_plan(request: DietPlanRequestDTO):
    return await services.generate_diet_plan(request)
