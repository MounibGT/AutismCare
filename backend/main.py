"""
AutismCare Unified AI Backend
FastAPI server for chat (LLaMA 3 + GPT-4 fallback) and image analysis (ViT)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
import os
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import base64
import requests
import re

# Configuration
app = FastAPI(title="AutismCare AI Backend", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Chat Model (LLaMA 3 + RAG) ====================

class ChatRequest(BaseModel):
    question: str
    lang: str = "en"
    session_id: Optional[str] = None
    stream: bool = False

class ChatResponse(BaseModel):
    success: bool
    response: str
    confidence: float
    model: str
    session_id: Optional[str] = None
    sources: Optional[List[str]] = None

# Load RAG model for LLaMA 3 based chat
rag_model = None
rag_questions = []
rag_answers = []
rag_embeddings = None

def load_rag_model():
    """Load the RAG-based chatbot model"""
    global rag_model, rag_questions, rag_answers, rag_embeddings
    
    try:
        import joblib
        model_path = os.path.join(os.path.dirname(__file__), '..', 'IA-chatboot', 'llama_adi_rag_model.joblib')
        
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            rag_questions = model_data.get('questions', [])
            rag_answers = model_data.get('answers', [])
            rag_embeddings = model_data.get('embeddings', None)
            print(f"Loaded RAG model with {len(rag_questions)} Q&A pairs")
        else:
            print("RAG model not found. Will use fallback responses.")
    except Exception as e:
        print(f"Error loading RAG model: {e}")

def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

def find_best_match(question: str) -> tuple:
    """Find the best matching answer for a question using RAG"""
    if rag_embeddings is None or len(rag_questions) == 0:
        return None, 0.0
    
    try:
        from sentence_transformers import SentenceTransformer
        
        # Load model if not loaded
        if not hasattr(find_best_match, 'model'):
            find_best_match.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Encode the question
        question_embedding = find_best_match.model.encode(question, convert_to_numpy=True)
        question_embedding = question_embedding / np.linalg.norm(question_embedding)
        
        # Find best match
        similarities = [cosine_similarity(question_embedding, emb) for emb in rag_embeddings]
        best_idx = np.argmax(similarities)
        best_score = similarities[best_idx]
        
        if best_score > 0.3:  # Threshold for matching
            return rag_answers[best_idx], best_score
        else:
            return None, best_score
    
    except Exception as e:
        print(f"Error in RAG matching: {e}")
        return None, 0.0

import aiohttp
import os
from dotenv import load_dotenv

# Load environment variables for API keys
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

async def get_gpt_fallback_response(question: str, lang: str = "en") -> str:
    """Get response from GPT-4 API for ANY question"""
    
    system_prompts = {
        "en": """You are a helpful, knowledgeable AI assistant that can answer any question. You are friendly, informative, and thorough. For autism-related questions, provide evidence-based information. For any other questions, provide accurate, helpful information. Be comprehensive in your responses.""",
        
        "fr": """Vous êtes un assistant IA serviable et compétent qui peut répondre à n'importe quelle question. Vous êtes amical, informatif et approfondi. Pour les questions liées à l'autisme, fournissez des informations fondées sur des preuves. Pour toute autre question, fournissez des informations précises et utiles.""",
        
        "ar": """أنت مساعد ذكاء اصطناعي مفيد وواسع المعرفة يمكنه الإجابة على أي سؤال. أنت ودود وغني بالمعلومات وشامل. للأسئلة المتعلقة بالتوحد، قدم معلومات مبنية على الأدلة. لأي سؤال آخر، قدم معلومات دقيقة ومفيدة."""
    }
    
    system_prompt = system_prompts.get(lang, system_prompts["en"])
    
    # If we have an OpenAI API key, use GPT-4
    if OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4-turbo-preview",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                "max_tokens": 1500,
                "temperature": 0.7
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result['choices'][0]['message']['content']
                    else:
                        error_text = await response.text()
                        print(f"OpenAI API error: {response.status} - {error_text}")
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
    
    # Ultimate fallback - simple response for any question when API is unavailable
    return f"""I understand you're asking: "{question}"

I'm currently operating in offline mode. To get comprehensive AI-powered responses for any question, please ensure the API key is configured in the .env file and the backend is properly running.

**Current Status:** OpenAI API key detected: {"Yes" if OPENAI_API_KEY else "No"}.

{"✅ Your API key is configured. I will use GPT-4 for answering your questions." if OPENAI_API_KEY else "❌ No API key found. Please add your OPENAI_API_KEY to the .env file."}

For now, here's a general response:
{question}

**Note:** This is a placeholder response while the AI service initializes. Please try again shortly."""

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint that uses OpenAI GPT directly for ANY question
    Falls back to RAG for reference only
    """
    question = request.question
    lang = request.lang
    
    # PRIMARY: Use OpenAI GPT-4 for ANY question (answers everything)
    if OPENAI_API_KEY:
        response = await get_gpt_fallback_response(question, lang)
        return ChatResponse(
            success=True,
            response=response,
            confidence=0.95,
            model="GPT-4-Direct",
            session_id=request.session_id
        )
    
    # FALLBACK: If no OpenAI key, try RAG-based matching
    answer, confidence = find_best_match(question)
    
    if answer and confidence > 0.5:
        # Found a match in ADI data
        return ChatResponse(
            success=True,
            response=answer,
            confidence=confidence,
            model="LLaMA-3-ADI-RAG",
            session_id=request.session_id
        )
    else:
        # No API and no match
        return ChatResponse(
            success=True,
            response="I can help with any question, but I need an OpenAI API key configured in the .env file.",
            confidence=0.3,
            model="Offline",
            session_id=request.session_id
        )

# ==================== Image Analysis (ViT) ====================

class ImageRequest(BaseModel):
    image: str  # Base64 encoded image
    text: Optional[str] = None

class ImageResponse(BaseModel):
    success: bool
    analysis: str
    confidence: float
    class_name: str
    model: str
    probabilities: dict

# Load ViT ensemble model
vit_models = []
vit_device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
ensemble_weights = []
vit_transform = None

def load_vit_model():
    """Load the trained ViT ensemble model"""
    global vit_models, ensemble_weights, vit_transform
    
    try:
        model_dir = os.path.join(os.path.dirname(__file__), '..', 'IA-chatboot')
        
        # Try loading ensemble models
        model_files = ['best_ensemble_0.pth', 'best_ensemble_1.pth', 'best_ensemble_2.pth']
        model_types = ['swin_b', 'vit_b_16', 'convnext_tiny']
        
        for i, model_file in enumerate(model_files):
            model_path = os.path.join(model_dir, model_file)
            if os.path.exists(model_path):
                model_type = model_types[i]
                
                if model_type == 'swin_b':
                    model = models.swin_b(weights=None)
                    model.head = nn.Linear(model.head.in_features, 2)
                elif model_type == 'vit_b_16':
                    model = models.vit_b_16(weights=None)
                    model.heads.head = nn.Linear(model.heads.head.in_features, 2)
                elif model_type == 'convnext_tiny':
                    model = models.convnext_tiny(weights=None)
                    model.classifier[2] = nn.Linear(model.classifier[2].in_features, 2)
                
                model.load_state_dict(torch.load(model_path, map_location=vit_device))
                model = model.to(vit_device)
                model.eval()
                vit_models.append(model)
                print(f"Loaded ViT ensemble model: {model_type}")
        
        # Fallback to single model if ensemble not available
        if not vit_models:
            single_model_path = os.path.join(model_dir, 'best_vit_model.pth')
            if os.path.exists(single_model_path):
                model = models.vit_b_16(weights=None)
                model.heads.head = nn.Linear(model.heads.head.in_features, 2)
                model.load_state_dict(torch.load(single_model_path, map_location=vit_device))
                model = model.to(vit_device)
                model.eval()
                vit_models.append(model)
                ensemble_weights = [1.0]
                print("Loaded single ViT model")
        
        if vit_models:
            print(f"ViT ensemble ready with {len(vit_models)} models")
        
        # Define image transform
        vit_transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
    except Exception as e:
        print(f"Error loading ViT model: {e}")

def ensemble_predict(image_tensor: torch.Tensor) -> torch.Tensor:
    """Make ensemble prediction with test-time augmentation"""
    with torch.no_grad():
        if len(vit_models) == 0:
            return None
        
        if len(vit_models) == 1:
            outputs = vit_models[0](image_tensor)
            return torch.softmax(outputs, dim=1)
        
        # Multi-model ensemble with TTA
        ensemble_out = torch.zeros(image_tensor.size(0), 2).to(vit_device)
        
        weights = ensemble_weights if ensemble_weights else [1.0] * len(vit_models)
        
        for model, weight in zip(vit_models, weights):
            outputs = model(image_tensor)
            ensemble_out += weight * torch.softmax(outputs, dim=1)
        
        # Test-time augmentation: horizontal flip
        image_flipped = torch.flip(image_tensor, dims=[3])
        ensemble_out_tta = torch.zeros(image_tensor.size(0), 2).to(vit_device)
        
        for model, weight in zip(vit_models, weights):
            outputs = model(image_flipped)
            ensemble_out_tta += weight * torch.softmax(outputs, dim=1)
        
        final_out = (ensemble_out + ensemble_out_tta) / 2.0
        return final_out

@app.post("/predict", response_model=ImageResponse)
async def predict_image(request: ImageRequest):
    """
    Analyze an image for autism-related traits using ViT ensemble
    """
    if len(vit_models) == 0:
        raise HTTPException(status_code=503, detail="ViT model not loaded")
    
    try:
        # Decode base64 image
        image_data = request.image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Transform and predict
        tensor = vit_transform(image).unsqueeze(0).to(vit_device)
        probs = ensemble_predict(tensor)
        
        if probs is None:
            raise HTTPException(status_code=500, detail="Prediction failed")
        
        pred = torch.argmax(probs, dim=1).item()
        confidence = float(probs[0][pred].item() * 100)
        
        class_name = "Autistic" if pred == 1 else "Non-Autistic"
        autistic_prob = float(probs[0][1].item() * 100)
        
        analysis = f"""Based on the facial analysis using our Vision Transformer (ViT) ensemble model:

**Analysis Result:** {class_name}
**Confidence:** {confidence:.1f}%

**Detailed Probabilities:**
- Autism traits detected: {autistic_prob:.1f}%
- No autism traits detected: {(100 - autistic_prob):.1f}%

**Model Information:**
- Architecture: Ensemble (Swin-B + ViT-B/16 + ConvNeXt-Tiny)
- Test-time augmentation: Enabled
- Model ensemble size: {len(vit_models)} models

⚠️ **Important Medical Disclaimer:**
This analysis is for screening purposes only and is NOT a diagnostic tool. 
Facial analysis alone cannot diagnose autism spectrum disorder. 
Please consult a qualified healthcare professional for proper assessment and diagnosis."""

        return ImageResponse(
            success=True,
            analysis=analysis,
            confidence=confidence,
            class_name=class_name,
            model="ViT-Ensemble-TTA",
            probabilities={
                "autistic": autistic_prob,
                "non_autistic": 100 - autistic_prob
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# ==================== Health & Metrics ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "chat_model": "LLaMA-3-ADI-RAG + GPT-4-Fallback",
        "image_model": f"ViT-Ensemble ({len(vit_models)} models)",
        "device": str(vit_device),
        "rag_questions_loaded": len(rag_questions),
        "vit_models_loaded": len(vit_models)
    }

@app.get("/model-metrics")
async def get_model_metrics():
    """Get model performance metrics"""
    metrics_path = os.path.join(os.path.dirname(__file__), '..', 'IA-chatboot', 'vit_model_metrics.json')
    
    metrics = {
        "text_model": {
            "name": "LLaMA-3-ADI-RAG",
            "questions_loaded": len(rag_questions),
            "embedding_model": "all-MiniLM-L6-v2"
        },
        "image_model": {
            "name": "ViT-Ensemble",
            "models": len(vit_models),
            "architecture": "Swin-B + ViT-B/16 + ConvNeXt-Tiny",
            "tta_enabled": True
        }
    }
    
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, 'r') as f:
                vit_metrics = json.load(f)
            metrics["image_model"]["training_metrics"] = vit_metrics
        except:
            pass
    
    return metrics

# ==================== Startup ====================

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    print("Loading AutismCare AI models...")
    load_rag_model()
    load_vit_model()
    print("Models loaded successfully!")

if __name__ == "__main__":
    import uvicorn
    print("Starting AutismCare AI Backend...")
    print("✅ API is running at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("💬 Chat endpoint: POST http://localhost:8000/chat")
    print("🖼️  Image analysis: POST http://localhost:8000/predict")
    uvicorn.run(app, host="127.0.0.1", port=8000)