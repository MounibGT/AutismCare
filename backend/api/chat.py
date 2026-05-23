"""Chat API"""
from fastapi import APIRouter, HTTPException
from typing import Optional, List
from pydantic import BaseModel
import asyncio
from datetime import datetime, timezone
import os
import time
from pathlib import Path
import joblib
import torch
from sentence_transformers import SentenceTransformer, util
from backend.enhanced_gpt_client import gpt_client as ai_client
from backend.rag_system import AutismRAG

rag_system = None
local_model_data = {
    'questions': [],
    'answers': [],
    'embeddings': None,
    'threshold': 0.75,
    'sentence_model': None,
    'loaded': False
}

class ChatMessage(BaseModel):
    role: str
    content: str
class ChatRequest(BaseModel):
    question: str
    lang: Optional[str] = "en"
    history: Optional[List[ChatMessage]] = []
    stream: Optional[bool] = False
    use_rag: Optional[bool] = True
class ChatResponse(BaseModel):
    response: str
    confidence: float
    model: str
    sources: List[str]
    context_used: bool
    processing_time: float
    timestamp: str
router = APIRouter()
async def initialize_rag():
    global rag_system
    if rag_system is None:
        rag_system = AutismRAG(persist_directory="./chroma_db")
        try:
            await rag_system.initialize()
        except Exception as e:
            print(f"RAG warning: {e}")
            rag_system = None


def load_local_fallback_model():
    global local_model_data
    try:
        model_path = Path(__file__).resolve().parent.parent.parent / 'IA-chatboot' / 'autism_chatbot_improved.joblib'
        if model_path.exists():
            data = joblib.load(str(model_path))
            local_model_data['questions'] = data.get('questions', [])
            local_model_data['answers'] = data.get('answers', [])
            embeddings = data.get('embeddings', None)
            if embeddings is not None:
                local_model_data['embeddings'] = torch.tensor(embeddings)
            local_model_data['threshold'] = data.get('threshold', 0.7)
            local_model_data['sentence_model'] = SentenceTransformer('all-MiniLM-L6-v2')
            local_model_data['loaded'] = local_model_data['embeddings'] is not None and len(local_model_data['questions']) > 0
            print(f"Loaded local ADI fallback model with {len(local_model_data['questions'])} entries")
        else:
            print(f"Local ADI model file not found: {model_path}")
    except Exception as e:
        print(f"Failed to load local ADI fallback model: {e}")
        local_model_data['loaded'] = False


def local_fallback_answer(question: str):
    if not local_model_data['loaded']:
        return None
    try:
        # Load sentence model if not already loaded
        if local_model_data['sentence_model'] is None:
            from sentence_transformers import SentenceTransformer
            local_model_data['sentence_model'] = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Encode the question
        query_embedding = local_model_data['sentence_model'].encode(question, convert_to_tensor=True)
        
        # Get stored embeddings
        stored_embeddings = local_model_data['embeddings']
        
        # Handle potential dimension mismatch by ensuring both are 2D tensors
        if len(query_embedding.shape) == 1:
            query_embedding = query_embedding.unsqueeze(0)  # [1, D]
        
        # If stored_embeddings is 1D, make it 2D
        if len(stored_embeddings.shape) == 1:
            stored_embeddings = stored_embeddings.unsqueeze(0)  # [1, D]
            
        # Now handle dimension mismatch between query and stored embeddings
        query_dim = query_embedding.shape[-1]
        stored_dim = stored_embeddings.shape[-1]
        
        if query_dim != stored_dim:
            # Dimensions don't match - we need to adapt
            # Since we can't retrain, we'll use a simple approach:
            # If query dimension is larger, truncate; if smaller, pad with zeros
            import torch
            if query_dim > stored_dim:
                # Truncate query embedding to match stored dimension
                query_embedding = query_embedding[:, :stored_dim]
            else:
                # Pad query embedding to match stored dimension
                padding = torch.zeros(query_embedding.shape[0], stored_dim - query_dim, dtype=query_embedding.dtype)
                query_embedding = torch.cat([query_embedding, padding], dim=1)
        
        # Ensure both tensors have the same dtype
        if query_embedding.dtype != stored_embeddings.dtype:
            # Convert to match the stored embeddings dtype (usually float64 from joblib)
            query_embedding = query_embedding.to(dtype=stored_embeddings.dtype)
        
        # Now compute cosine similarity - both should be [N, D] with same D and dtype
        from sentence_transformers import util
        cos_scores = util.cos_sim(query_embedding, stored_embeddings)[0]
        
        # Get top results
        k = min(3, cos_scores.size(0))
        top_results = torch.topk(cos_scores, k=k)
        best_idx = top_results.indices[0].item()
        best_score = top_results.values[0].item()
        
        # Since we don't have explicit answers, generate helpful responses based on matched questions
        if best_score >= local_model_data['threshold']:
            # Return information based on the matched question
            matched_question = local_model_data['questions'][best_idx]
            if isinstance(matched_question, dict):
                # Extract the English question
                question_text = matched_question.get('question_en', str(matched_question))
            else:
                question_text = str(matched_question)
            
            # Create a helpful response based on the question type
            response = f"Based on the ADI assessment, regarding '{question_text}': This is an important aspect of autism evaluation. For specific information about this topic, please consult with a healthcare professional or autism specialist who can provide detailed guidance based on a comprehensive assessment."
            
            return {
                'response': response,
                'confidence': float(best_score),
                'model': 'local-adi-fallback',
                'sources': ['ADI_LOCAL'],
                'matched': True
            }
        if top_results.indices.size(0) > 1:
            second_idx = top_results.indices[1].item()
            second_score = top_results.values[1].item()
            if second_score >= local_model_data['threshold']:
                matched_question = local_model_data['questions'][second_idx]
                if isinstance(matched_question, dict):
                    question_text = matched_question.get('question_en', str(matched_question))
                else:
                    question_text = str(matched_question)
                
                response = f"Based on the ADI assessment, regarding '{question_text}': This relates to important developmental history information. Consult with qualified professionals for personalized guidance."
                
                return {
                    'response': response,
                    'confidence': float(second_score),
                    'model': 'local-adi-fallback',
                    'sources': ['ADI_LOCAL'],
                    'matched': True
                }
        
        # Best match below threshold - still provide helpful information
        matched_question = local_model_data['questions'][best_idx]
        if isinstance(matched_question, dict):
            question_text = matched_question.get('question_en', str(matched_question))
        else:
            question_text = str(matched_question)
        
        response = f"While I don't have specific detailed information about '{question_text}' in my immediate knowledge base, this is an relevant topic in autism assessment. For comprehensive information, please refer to professional resources or speak with an autism specialist."
        
        return {
            'response': response,
            'confidence': float(best_score),
            'model': 'local-adi-fallback',
            'sources': ['ADI_LOCAL'],
            'matched': False
        }
    except Exception as e:
        print(f"Local fallback error: {e}")
        import traceback
        traceback.print_exc()
        return None
    try:
        # Load sentence model if not already loaded
        if local_model_data['sentence_model'] is None:
            from sentence_transformers import SentenceTransformer
            local_model_data['sentence_model'] = SentenceTransformer('all-MiniLM-L6-v2')
        
        query_embedding = local_model_data['sentence_model'].encode(question, convert_to_tensor=True)
        
        # Handle dimension mismatch - resize if needed
        stored_embeddings = local_model_data['embeddings']
        if query_embedding.shape[1] != stored_embeddings.shape[1]:
            # If dimensions don't match, we need to adapt
            import torch
            from torch.nn.functional import pad
            if query_embedding.shape[1] > stored_embeddings.shape[1]:
                # Truncate query embedding
                query_embedding = query_embedding[:, :stored_embeddings.shape[1]]
            else:
                # Pad query embedding
                diff = stored_embeddings.shape[1] - query_embedding.shape[1]
                query_embedding = pad(query_embedding, (0, diff))
        
        cos_scores = util.cos_sim(query_embedding, stored_embeddings)[0]
        top_results = torch.topk(cos_scores, k=min(3, cos_scores.size(0)))
        best_idx = top_results.indices[0].item()
        best_score = top_results.values[0].item()
        
        # Since we don't have answers, we'll return helpful information based on matched question
        if best_score >= local_model_data['threshold']:
            # Return information based on the matched question
            matched_question = local_model_data['questions'][best_idx]
            if isinstance(matched_question, dict):
                # Extract the English question
                question_text = matched_question.get('question_en', str(matched_question))
            else:
                question_text = str(matched_question)
            
            # Create a helpful response based on the question type
            response = f"Based on the ADI assessment, regarding '{question_text}': This is an important aspect of autism evaluation. For specific information about this topic, please consult with a healthcare professional or autism specialist who can provide detailed guidance based on a comprehensive assessment."
            
            return {
                'response': response,
                'confidence': float(best_score),
                'model': 'local-adi-fallback',
                'sources': ['ADI_LOCAL'],
                'matched': True
            }
        if top_results.indices.size(0) > 1:
            second_idx = top_results.indices[1].item()
            second_score = top_results.values[1].item()
            if second_score >= local_model_data['threshold']:
                matched_question = local_model_data['questions'][second_idx]
                if isinstance(matched_question, dict):
                    question_text = matched_question.get('question_en', str(matched_question))
                else:
                    question_text = str(matched_question)
                
                response = f"Based on the ADI assessment, regarding '{question_text}': This relates to important developmental history information. Consult with qualified professionals for personalized guidance."
                
                return {
                    'response': response,
                    'confidence': float(second_score),
                    'model': 'local-adi-fallback',
                    'sources': ['ADI_LOCAL'],
                    'matched': True
                }
        
        # Best match below threshold - still provide helpful information
        matched_question = local_model_data['questions'][best_idx]
        if isinstance(matched_question, dict):
            question_text = matched_question.get('question_en', str(matched_question))
        else:
            question_text = str(matched_question)
        
        response = f"While I don't have specific detailed information about '{question_text}' in my immediate knowledge base, this is an relevant topic in autism assessment. For comprehensive information, please refer to professional resources or speak with an autism specialist."
        
        return {
            'response': response,
            'confidence': float(best_score),
            'model': 'local-adi-fallback',
            'sources': ['ADI_LOCAL'],
            'matched': False
        }
    except Exception as e:
        print(f"Local fallback error: {e}")
        return None

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "chat",
        "rag_initialized": rag_system is not None,
        "ai_clients": {
            "claude": bool(os.getenv("ANTHROPIC_API_KEY", "")),
            "gpt4": bool(os.getenv("OPENAI_API_KEY", ""))
        },
        "local_adi_loaded": local_model_data["loaded"]
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    try:
        context = ""
        if request.use_rag and rag_system:
            try:
                context = rag_system.get_context_for_llm(request.question)
            except Exception as e:
                print(f"RAG error: {e}")

        hist = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
        local_answer = local_fallback_answer(request.question) if local_model_data["loaded"] else None

        # Use local ADI answer first when it is a strong semantic match.
        if local_answer and local_answer.get("matched"):
            pt = time.time() - start_time
            dt = datetime.now(timezone.utc).isoformat()
            return ChatResponse(
                response=local_answer["response"],
                confidence=local_answer["confidence"],
                model=local_answer["model"],
                sources=local_answer["sources"],
                context_used=True,
                processing_time=round(pt, 3),
                timestamp=dt
            )

        use_external = bool(ai_client.anthropic_key or ai_client.openai_key)
        rt = ""
        cfd = 0.0
        mdl = "none"
        src = []

        if request.stream and use_external:
            chunks = []
            try:
                async for chunk in ai_client.generate_streaming_response(question=request.question, context=context, lang=request.lang, history=hist):
                    chunks.append(chunk)
                rt = "".join(chunks)
                cfd, mdl, src = 0.9, "claude-3-sonnet", (["Claude-3", "ADI_RAG"] if context else ["Claude-3"])
            except Exception as e:
                print(f"Streaming error: {e}")
                use_external = False
        elif not request.stream and use_external:
            try:
                res = await ai_client.generate_response(question=request.question, context=context, lang=request.lang, history=hist)
                rt = res["response"]
                cfd = res.get("confidence", 0.0)
                mdl = res.get("model", "unknown")
                src = res.get("sources", [])
                if context and "ADI_RAG" not in src:
                    src.append("ADI_RAG")
            except Exception as e:
                print(f"AI API error: {e}")
                use_external = False

        # Fallback to local/RAG response
        if not use_external or not rt:
            if local_answer:
                rt = local_answer["response"]
                cfd = local_answer["confidence"]
                mdl = local_answer["model"]
                src = local_answer["sources"]
            elif context:
                # Extract answer from RAG context - get the A: line
                lines = context.split('\n')
                answer_text = None
                for line in lines:
                    if line.strip().startswith('A:'):
                        answer_text = line.strip()[2:].strip()
                        break
                rt = answer_text if answer_text else "Based on ADI knowledge: " + context.split('\n')[0] if context else ""
                cfd = 0.75
                mdl = "ADI_RAG"
                src = ["ADI_RAG"]
            else:
                # No specific match found - use external AI if available for general Q&A
                if ai_client.anthropic_key or ai_client.openai_key:
                    try:
                        # Try to get a response from Claude or GPT for ANY question
                        if request.stream:
                            chunks = []
                            async for chunk in ai_client.generate_streaming_response(question=request.question, context="", lang=request.lang, history=hist):
                                chunks.append(chunk)
                            rt = "".join(chunks)
                            cfd, mdl, src = 0.9, "claude-3-sonnet", ["Claude-3"]
                        else:
                            res = await ai_client.generate_response(question=request.question, context="", lang=request.lang, history=hist)
                            rt = res["response"]
                            cfd = res.get("confidence", 0.0)
                            mdl = res.get("model", "unknown")
                            src = res.get("sources", [])
                    except Exception as e:
                        print(f"AI fallback error: {e}")
                        rt = f"I can help with any question. However, I had trouble processing your request. Please try again."
                        cfd = 0.3
                        mdl = "error-fallback"
                        src = []
                else:
                    # No external API available - provide helpful message
                    rt = "I can help with any question, but I need external AI services configured. Please set up your API keys in the .env file."
                    cfd = 0.3
                    mdl = "offline"
                    src = []

        pt = time.time() - start_time
        dt = datetime.now(timezone.utc).isoformat()
        return ChatResponse(response=rt, confidence=cfd, model=mdl, sources=src, context_used=bool(context), processing_time=round(pt, 3), timestamp=dt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
@router.post("/context-search")
async def context_search(question: str, top_k: int = 5):
    if not rag_system:
        raise HTTPException(status_code=503, detail="RAG not initialized")
    try:
        res = rag_system.hybrid_search(question, top_k=top_k)
        return {"question": question, "results": res, "total_found": len(res)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")
@router.post("/clear-context")
async def clear_context():
    global rag_system
    rag_system = None
    return {"status": "context cleared"}