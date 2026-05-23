from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "report"}

class Report(BaseModel):
    id: str
    type: str
    data: dict
    generated_at: str

@router.post("/generate", response_model=Report)
async def generate_report(data: dict):
    import datetime
    return {"id": "temp", "type": "autism_assessment", "data": data, "generated_at": datetime.datetime.utcnow().isoformat()}

