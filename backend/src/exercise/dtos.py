from pydantic import BaseModel

class BicepCurlResponse(BaseModel):
    count: int
    stage: str  
    feedback: str  