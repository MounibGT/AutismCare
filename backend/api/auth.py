from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth"}

class User(BaseModel):
    email: str
    full_name: Optional[str] = None

@router.post("/login")
async def login(email: str, password: str):
    return {"token": "temp_token", "user": {"email": email}}

@router.post("/register")
async def register(email: str, password: str, full_name: Optional[str] = None):
    return {"token": "temp_token", "user": {"email": email, "full_name": full_name}}

