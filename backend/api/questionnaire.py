from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "questionnaire"}

class QuestionnaireResponse(BaseModel):
    id: str
    type: str
    questions: list
    completed: bool

@router.post("/submit", response_model=QuestionnaireResponse)
async def submit_questionnaire(data: dict):
    return {"id": "temp", "type": "ADI", "questions": [], "completed": True}

@router.get("/{questionnaire_id}")
async def get_questionnaire(questionnaire_id: str):
    return {"id": questionnaire_id, "type": "ADI", "questions": []}

