from pydantic import BaseModel, Field 
from typing import Literal

class ProductScanResponseDTO(BaseModel):
    product_name:str = Field(...)
    product_ingredients:str = Field(...)
    product_safety:str = Field(...)
    product_advice:str = Field(...) 
    
class ProductScanRequestDTO(BaseModel):
    product_barcode: str = Field(...)
    
class ProductScanResponseDTO(BaseModel):
    product_name: str = Field(...)
    product_ingredients: str = Field(...)
    product_safety: Literal["safe", "unsafe", "caution"] = Field(...)
    details: str = Field(...)
    