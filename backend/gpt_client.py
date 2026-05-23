"""
GPT/Claude API Client for Autism Assistant
Provides high-quality responses using RAG context
"""

import os
import aiohttp
from typing import Optional, Dict, List

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

async def get_autism_response(
    question: str,
    lang: str = "en",
    rag_context: Optional[object] = None,
    history: Optional[List[dict]] = None
) -> Dict:
    """
    Get autism-specialized response using GPT-4 or Claude
    
    Priority: Claude > GPT-4
    Uses RAG context from ADI knowledge base
    """
    
    # Build context from RAG
    context = ""
    if rag_context:
        try:
            context = rag_context.get_context_for_llm(question)
        except:
            context = "ADI-based context available"
    
    # System prompt for autism specialization
    system_prompts = {
        "en": """You are an AI assistant specialized in autism spectrum disorder (ASD). 
        Provide evidence-based, compassionate, and accurate information about autism.
        Use the provided context from ADI-R (Autism Diagnostic Interview) dataset.
        Always include a disclaimer that you're not a substitute for professional medical advice.
        Focus on support, understanding, and evidence-based recommendations.""",
        
        "fr": """Vous êtes un assistant IA spécialisé dans le trouble du spectre de l'autisme (TSA).
        Fournissez des informations évidence-bases, compatissantes et précises sur l'autisme.
        Utilisez le contexte fourni de l'ADI-R (Autism Diagnostic Interview).
        Incluez toujours une mention qu'elle ne remplace pas un avis médical professionnel.""",
        
        "ar": """أنت مساعد ذكاء اصطناعي متخصص في اضطراب طيف التوحد (ASD).
        قدم معلومات مبنية على الأدلة والرحيمة والدقيقة عن التوحد.
        استخدم السياق المقدم من مجموعة بيانات ADI-R.
        احرص دائماً على إرفاق إخلار ذلك لا يعتبر بديلاً عن النصيحة الطبية المتخصصة."""
    }
    
    system_prompt = system_prompts.get(lang, system_prompts["en"])
    
    # Try Claude first (better for long contexts)
    if ANTHROPIC_API_KEY:
        try:
            return await _call_claude(
                question=question,
                system_prompt=system_prompt,
                context=context,
                lang=lang
            )
        except Exception as e:
            print(f"Claude API error: {e}")
    
    # Fallback to GPT-4
    if OPENAI_API_KEY:
        try:
            return await _call_gpt4(
                question=question,
                system_prompt=system_prompt,
                context=context,
                lang=lang
            )
        except Exception as e:
            print(f"GPT-4 API error: {e}")
    
    # Fallback to knowledge base only
    is_autism = _is_autism_related(question)
    response = context if context else _get_fallback_response(lang)

    return {
        "response": response,
        "confidence": 0.8 if context else 0.5,
        "sources": ["ADI_Knowledge_Base"] if context else ["LOCAL_KB"],
        "is_autism_related": is_autism,
        "model": "adi-rag" if context else "local"
    }

async def _call_claude(question: str, system_prompt: str, context: str, lang: str) -> Dict:
    """Call Anthropic Claude API"""
    url = "https://api.anthropic.com/v1/messages"
    
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
    }
    
    user_content = f"Context from ADI knowledge base:\n{context}\n\nQuestion: {question}"
    
    payload = {
        "model": "claude-3-sonnet-20240229",
        "max_tokens": 1000,
        "temperature": 0.7,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_content}]
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as response:
            result = await response.json()
            
            return {
                "response": result["content"][0]["text"],
                "confidence": 0.9,
                "sources": ["Claude-3"] + (["ADI_KB"] if context else []),
                "is_autism_related": True
            }

async def _call_gpt4(question: str, system_prompt: str, context: str, lang: str) -> Dict:
    """Call OpenAI GPT-4 API"""
    url = "https://api.openai.com/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
    ]
    
    payload = {
        "model": "gpt-4-turbo-preview",
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.7
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as response:
            result = await response.json()
            
            return {
                "response": result["choices"][0]["message"]["content"],
                "confidence": 0.85,
                "sources": ["GPT-4"] + (["ADI_KB"] if context else []),
                "is_autism_related": True
            }

def _is_autism_related(question: str) -> bool:
    """Check if question is autism-related"""
    keywords = [
        'autism', 'autistic', 'asd', 'spectrum', 'neurodivergent',
        'developmental', 'behavior', 'therapy', 'intervention',
        'communication', 'social', 'sensory', 'diagnosis', 'characteristic',
        'support', 'sign', 'symptom', 'repetitive', 'routine', 'stimming',
        'توحد', 'توحدي', 'طيف التوحد', 'علاج', 'تشخيص', 'سلوك',
        'autisme', 'autistique', 'spectre', 'thérapie', 'diagnostic'
    ]
    question_lower = question.lower()
    return any(kw in question_lower for kw in keywords)

def _get_fallback_response(lang: str) -> str:
    """Get fallback response when APIs unavailable"""
    responses = {
        "en": "I'm designed to provide information about autism spectrum disorder. I can help with questions about diagnosis, therapies, communication strategies, and support resources.",
        "fr": "Je suis conçu pour fournir des informations sur le trouble du spectre de l'autisme. Je peux aider avec les questions sur le diagnostic, les thérapies, les stratégies de communication et les ressources de soutien.",
        "ar": "تم إنشائي لتقديم معلومات حول اضطراب طيف التوحد. يمكنني المساعدة في أسئلة حول التشخيص والعلاجات واستراتيجيات التواصل وموارد الدعم."
    }
    return responses.get(lang, responses["en"])