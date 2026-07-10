from fastapi import APIRouter
from src.product_scanner import services
from src.product_scanner.dtos import ProductScanRequestDTO

router = APIRouter()

@router.post("/scan-product")
async def scan_product(barcode: ProductScanRequestDTO):
    return await services.scan_product(barcode)
    