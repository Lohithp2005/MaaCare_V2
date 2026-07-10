from pydantic import BaseModel
from fastapi import APIRouter, Depends, Request
from src.chat import services
from sqlalchemy.orm import Session
from src.utils.db import get_db

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    
@router.post("/chat")
async def chat(query: ChatRequest, request: Request, db: Session = Depends(get_db)):
    return await services.run_health_assistant(query.message, request, db)