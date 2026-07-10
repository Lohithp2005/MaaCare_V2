from fastapi import HTTPException, status 
from src.product_scanner.dtos import ProductScanResponseDTO
from src.utils.settings import settings  
import httpx
from google import genai

gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def scan_product(barcode):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://world.openfoodfacts.net/api/v2/product/{barcode}")
        data =  response.json()
        
        product = data.get("product",{})
        
        product_name = product.get("product_name", "Unknown Product")
        product_ingredients = product.get("ingredients_text", "unknown ingredients")
        
        interaction = gemini_client.models.generate_content(
            model="gemini-3.5-flash",
            contents=f"check whether the {product_name} with ingredients {product_ingredients} is safe for consumption or not during pregnancy. If it is safe, respond with either safe ,unsafe or caution with detail of why you said in 3 lines.",
             config={
        "response_mime_type": "application/json",
        "response_schema": ProductScanResponseDTO,
    },
        )
        
        gemini_response = interaction.parsed
        
        return ProductScanResponseDTO(
            product_name=product_name,
            product_ingredients=product_ingredients,
            product_safety=gemini_response.product_safety,
            details=gemini_response.details
        )
        