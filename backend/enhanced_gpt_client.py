"""
Enhanced GPT/Claude Client with Advanced Prompt Engineering
Optimized for autism support with high accuracy responses
"""

import os
from dotenv import load_dotenv
import aiohttp
import tiktoken
from typing import Optional, Dict, List, AsyncGenerator
import json

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

class EnhancedGPTClient:
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.encoder = tiktoken.get_encoding("cl100k_base")
        
        # System prompts optimized for both autism and general knowledge
        self.system_prompts = {
            "en": """You are an intelligent and helpful AI assistant.

CAPABILITIES:
1. Answer ANY question accurately and thoroughly
2. Provide evidence-based responses
3. Use compassionate and non-judgmental tone
4. When answering autism-related questions, emphasize spectrum diversity and strengths
5. Include relevant disclaimers when necessary

RESPONSE STRUCTURE:
- Start with clear, direct answer
- Provide structured information with bullet points when helpful
- Include practical examples
- Add context and resources when relevant

CONTEXT (if available):
{context}

Now respond to the user's question thoughtfully and accurately.""",

            "fr": """Vous êtes un assistant IA intelligent et serviable.

CAPACITÉS:
1. Répondre à TOUTE question avec précision
2. Fournir des réponses basées sur les preuves
3. Utiliser un ton compatissant et non-jugeant
4. Pour les questions sur l'autisme, souligner la diversité du spectre
5. Inclure les avertissements pertinents si nécessaire

STRUCTURE DE RÉPONSE:
- Commencer par une réponse claire et directe
- Fournir des informations structurées
- Inclure des exemples pratiques
- Ajouter du contexte et des ressources

CONTEXTE (si disponible):
{context}

Répondez maintenant à la question de l'utilisateur.""",

            "ar": """أنت مساعد ذكاء اصطناعي ذكي وخدوم.

القدرات:
1. الإجابة على أي سؤال بدقة
2. تقديم إجابات مبنية على الأدلة
3. استخدام نبرة متعاطفة وغير حكمية
4. عند الإجابة على الأسئلة المتعلقة بالتوحد، أكد على تنوع الطيف
5. أضف إخلاءات المسؤولية عند الضرورة

هيكل الرد:
- ابدأ بإجابة واضحة وحاسمة
- قدم معلومات منظمة
- أضف أمثلة عملية
- أضف السياق والموارد

السياق (إن أمكن):
{context}

الآن أجب على سؤال المستخدم بعناية ودقة."""
        }
    
    async def generate_streaming_response(
        self, 
        question: str, 
        context: str, 
        lang: str = "en",
        history: Optional[List[Dict]] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response from Claude API (best for long contexts)"""
        
        system_prompt = self.system_prompts[lang].format(context=context)
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (keep last 5 exchanges)
        if history:
            for msg in history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": question})
        
        # Use Claude Sonnet (128k context)
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.anthropic_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": "claude-3-sonnet-20240229",
            "max_tokens": 2000,
            "temperature": 0.7,
            "messages": messages,
            "stream": True
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        async for line in response.content:
                            if line.startswith(b'data: '):
                                data = line[6:].strip()
                                if data != b'[DONE]':
                                    try:
                                        chunk = json.loads(data)
                                        if chunk.get('type') == 'content_block_delta':
                                            text = chunk.get('delta', {}).get('text', '')
                                            if text:
                                                yield text
                                    except json.JSONDecodeError:
                                        continue
                    else:
                        yield f"\n[Error: API returned {response.status}]"
        except Exception as e:
            yield f"\n[Streaming error: {str(e)}]"
    
    async def generate_response(
        self,
        question: str,
        context: str,
        lang: str = "en",
        history: Optional[List[Dict]] = None
    ) -> Dict:
        """Generate complete response (non-streaming fallback)"""
        
        system_prompt = self.system_prompts[lang].format(context=context)
        
        messages = [{"role": "system", "content": system_prompt}]
        
        if history:
            for msg in history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": question})
        
        # Try Claude first
        if self.anthropic_key:
            try:
                url = "https://api.anthropic.com/v1/messages"
                headers = {
                    "x-api-key": self.anthropic_key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                }
                
                payload = {
                    "model": "claude-3-sonnet-20240229",
                    "max_tokens": 2000,
                    "temperature": 0.7,
                    "messages": messages
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=payload, headers=headers) as response:
                        if response.status == 200:
                            result = await response.json()
                            return {
                                "response": result['content'][0]['text'],
                                "confidence": 0.9,
                                "sources": ["Claude-3-Sonnet", "ADI_RAG"],
                                "model": "claude-3-sonnet"
                            }
            except Exception as e:
                print(f"Claude error: {e}")
        
        # Fallback to GPT-4
        if self.openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": "gpt-4-turbo-preview",
                    "messages": messages,
                    "max_tokens": 2000,
                    "temperature": 0.7
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=payload, headers=headers) as response:
                        if response.status == 200:
                            result = await response.json()
                            return {
                                "response": result['choices'][0]['message']['content'],
                                "confidence": 0.85,
                                "sources": ["GPT-4-Turbo", "ADI_RAG"],
                                "model": "gpt-4-turbo"
                            }
            except Exception as e:
                print(f"GPT-4 error: {e}")
        
        return {
            "response": _extract_answer_from_context(context) if context else "I can help you with any question! However, I'm currently in offline mode (no external AI APIs configured). Please set up your OPENAI_API_KEY or ANTHROPIC_API_KEY in the .env file to get full AI-powered responses.",
            "confidence": 0.75 if context else 0.5,
            "sources": ["ADI_RAG"] if context else ["LOCAL_KB"],
            "model": "adi-rag" if context else "local"
        }

def _extract_answer_from_context(context: str) -> str:
    """Extract just the answer from RAG context."""
    if not context:
        return ""
    lines = context.split('\n')
    for line in lines:
        if line.strip().startswith('A:'):
            return line.strip()[2:].strip()
    return context.split('\n')[0] if lines else ""

# Singleton instance
gpt_client = EnhancedGPTClient()