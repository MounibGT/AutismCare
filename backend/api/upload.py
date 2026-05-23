from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional
from pydantic import BaseModel
from backend.vit_analyzer import analyzer

router = APIRouter()

class UploadResponse(BaseModel):
    success: bool
    result: dict
    filename: Optional[str]
    error: Optional[str]

class ImageAnalysisRequest(BaseModel):
    image_base64: str

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "upload"}

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        return {"success": True, "filename": file.filename, "size": len(contents), "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

@router.post("/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    try:
        result = await analyzer.analyze(request.image_base64)
        return {"success": True, "result": result, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

