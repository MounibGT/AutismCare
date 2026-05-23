"""
Enhanced RAG (Retrieval Augmented Generation) System using ChromaDB + Hybrid Search
Uses ADI dataset as knowledge base for autism-specific responses
"""

import chromadb
from sentence_transformers import SentenceTransformer
import json
import os
from typing import List, Dict, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import re

class AutismRAG:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self.embedding_model = None
        self.client = None
        self.collection = None
        self.documents_cache = []
        
    async def initialize(self):
        """Initialize the RAG system with ADI dataset"""
        # Load high-quality embedding model
        self.embedding_model = SentenceTransformer('BAAI/bge-large-en-v1.5')
        
        # Initialize ChromaDB with better config
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        
        try:
            self.collection = self.client.get_collection(name="autism_adi_kb")
        except:
            self.collection = self.client.create_collection(
                name="autism_adi_kb",
                metadata={"hnsw:space": "cosine", "hnsw:construction_ef": 200, "hnsw:search_ef": 100}
            )
            await self._populate_knowledge_base()
    
    async def _populate_knowledge_base(self):
        """Load ADI dataset with rich metadata"""
        adi_data_path = "../autism_question_bot_data.txt"
        
        if not os.path.exists(adi_data_path):
            print(f"ADI data not found at {adi_data_path}")
            return
        
        questions = []
        documents = []
        metadatas = []
        
        with open(adi_data_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        qa_pairs = content.split('\n\n')
        
        for idx, qa in enumerate(qa_pairs):
            if not qa.strip():
                continue
            
            lines = qa.strip().split('\n')
            if len(lines) >= 2:
                q_line = lines[0].replace('Q: ', '').strip()
                a_line = lines[1].replace('A: ', '').strip()
                
                if q_line and a_line:
                    questions.append(q_line)
                    
                    # Enhanced document with structured metadata
                    doc_text = f"Q: {q_line}\nA: {a_line}"
                    documents.append(doc_text)
                    
                    # Extract keywords for hybrid search
                    keywords = self._extract_keywords(q_line + " " + a_line)
                    
                    metadatas.append({
                        "id": idx,
                        "category": self._categorize_question(q_line),
                        "question": q_line,
                        "answer": a_line,
                        "source": "ADI_R_dataset",
                        "keywords": keywords,
                        "question_length": len(q_line.split()),
                        "has_score_mapping": "score" in a_line.lower() or "coter" in a_line.lower() or "cot" in a_line.lower()
                    })
        
        # Batch encode for efficiency
        embeddings = self.embedding_model.encode(questions, batch_size=32, show_progress_bar=False).tolist()
        
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=[f"q_{i}" for i in range(len(documents))]
        )
        
        # Cache documents for keyword search
        self.documents_cache = [{"id": f"q_{i}", "document": doc, "metadata": meta} 
                               for i, (doc, meta) in enumerate(zip(documents, metadatas))]
        
        print(f"✅ Populated {len(documents)} Q&A pairs into ChromaDB with enhanced metadata")
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        # Simple keyword extraction
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        stopwords = {'this', 'that', 'with', 'from', 'have', 'been', 'were', 'would', 'could', 'should'}
        return list(set([w for w in words if w not in stopwords]))[:10]
    
    def _categorize_question(self, question: str) -> str:
        """Categorize question based on keywords"""
        q_lower = question.lower()
        
        categories = {
            'family_history': ['family', 'parent', 'sibling', 'brother', 'sister', 'adopted'],
            'development': ['development', 'milestone', 'walk', 'talk', 'speech', 'language'],
            'diagnosis': ['diagnos', 'doctor', 'assessment', 'evaluation'],
            'behavior': ['behavior', 'behaviour', 'routine', 'repetitive', 'stimming'],
            'social': ['social', 'interaction', 'friend', 'play'],
            'medical': ['medication', 'treatment', 'hearing', 'condition'],
            'education': ['school', 'learning', 'reading', 'spelling', 'IEP']
        }
        
        for cat, keywords in categories.items():
            if any(kw in q_lower for kw in keywords):
                return cat
        
        return 'general'
    
    def hybrid_search(self, query: str, top_k: int = 5, semantic_weight: float = 0.7) -> List[Dict]:
        """
        Hybrid search combining semantic similarity and keyword matching
        This improves accuracy by using both methods
        """
        # Semantic search
        query_embedding = self.embedding_model.encode([query]).tolist()
        semantic_results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k * 2  # Get more candidates
        )
        
        # Keyword search (simple text matching)
        query_keywords = set(re.findall(r'\b[a-zA-Z]{4,}\b', query.lower()))
        keyword_scored = []
        
        for doc in self.documents_cache:
            meta = doc["metadata"]
            doc_keywords = set(meta.get("keywords", []))
            overlap = len(query_keywords & doc_keywords)
            keyword_scored.append((doc["id"], overlap))
        
        # Sort by keyword score
        keyword_scored.sort(key=lambda x: x[1], reverse=True)
        top_keyword_ids = [k[0] for k in keyword_scored[:top_k]]
        
        # Combine results (hybrid scoring)
        combined = {}
        
        for i, doc_id in enumerate(semantic_results['ids'][0]):
            semantic_score = 1 - semantic_results['distances'][0][i]  # Convert distance to similarity
            keyword_boost = 1.0 if doc_id in top_keyword_ids else 0.0
            
            # Weighted combination
            final_score = (semantic_weight * semantic_score) + ((1 - semantic_weight) * keyword_boost)
            
            idx = int(doc_id.split('_')[1])
            combined[doc_id] = {
                "score": final_score,
                "semantic_score": semantic_score,
                "document": semantic_results['documents'][0][i],
                "metadata": semantic_results['metadatas'][0][i]
            }
        
        # Sort by combined score and return top_k
        sorted_results = sorted(combined.values(), key=lambda x: x["score"], reverse=True)[:top_k]
        
        return sorted_results
    
    def get_context_for_llm(self, query: str, max_tokens: int = 2000) -> str:
        """Get high-quality context with optimal token usage"""
        results = self.hybrid_search(query, top_k=3)
        context_parts = []
        total_chars = 0
        
        for r in results:
            doc_text = f"[Relevant Knowledge - Relevance: {r['semantic_score']:.2f}]\n{r['document']}"
            doc_chars = len(doc_text)
            
            if total_chars + doc_chars > max_tokens * 4:
                remaining = max_tokens * 4 - total_chars
                if remaining > 200:
                    context_parts.append(doc_text[:int(remaining)] + "...")
                break
            
            context_parts.append(doc_text)
            total_chars += doc_chars
        
        return "\n\n".join(context_parts)