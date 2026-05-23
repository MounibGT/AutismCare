"""
LLaMA 3 ADI RAG API Server
Simple Flask server for autism Q&A using the trained RAG model
"""

from flask import Flask, request, jsonify
import json
import os
import sys

app = Flask(__name__)

# Try to load the RAG model
rag_model = None
questions = []
answers = []
embeddings = None

def load_rag_model():
    """Load the trained RAG model"""
    global rag_model, questions, answers, embeddings
    
    model_path = os.path.join(os.path.dirname(__file__), 'IA-chatboot', 'llama_adi_rag_model.joblib')
    
    if os.path.exists(model_path):
        try:
            import joblib
            model_data = joblib.load(model_path)
            questions = model_data.get('questions', [])
            answers = model_data.get('answers', [])
            embeddings = model_data.get('embeddings', None)
            print(f"Loaded RAG model with {len(questions)} Q&A pairs")
            return True
        except Exception as e:
            print(f"Error loading RAG model: {e}")
            return False
    else:
        print(f"RAG model not found at {model_path}")
        print("Please run: cd IA-chatboot && python train_llama_adi.py")
        return False

def find_best_match(question_text):
    """Find the best matching answer for a question"""
    if embeddings is None or len(questions) == 0:
        return None, 0.0
    
    try:
        from sentence_transformers import SentenceTransformer
        import numpy as np
        
        # Load model if not loaded
        if not hasattr(find_best_match, 'model'):
            find_best_match.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Encode the question
        question_embedding = find_best_match.model.encode(question_text, convert_to_numpy=True)
        question_embedding = question_embedding / np.linalg.norm(question_embedding)
        
        # Find best match
        similarities = [np.dot(question_embedding, emb) / (np.linalg.norm(emb) * np.linalg.norm(question_embedding) + 1e-8) for emb in embeddings]
        best_idx = np.argmax(similarities)
        best_score = similarities[best_idx]
        
        if best_score > 0.3:
            return answers[best_idx], best_score
        else:
            return None, best_score
    
    except Exception as e:
        print(f"Error in RAG matching: {e}")
        return None, 0.0

@app.route('/chat', methods=['POST'])
def chat():
    """Chat endpoint"""
    try:
        data = request.json
        question = data.get('question', '')
        
        if not question:
            return jsonify({'response': 'Please provide a question.', 'confidence': 0.0})
        
        # Try RAG matching
        answer, confidence = find_best_match(question)
        
        if answer and confidence > 0.5:
            return jsonify({
                'success': True,
                'response': answer,
                'confidence': confidence,
                'model': 'LLaMA-3-ADI-RAG'
            })
        else:
            # Fallback response
            return jsonify({
                'success': True,
                'response': f"""I'm here to help with autism-related questions. I can provide information about:

• Early signs and symptoms of autism
• Diagnosis process and assessment tools
• Evidence-based therapies and interventions
• Support resources for individuals and families

Your question about "{question}" is important. For detailed information, please consult the full ADI assessment or speak with a healthcare professional.

**Important:** This is general information only, not medical advice.""",
                'confidence': confidence if confidence > 0 else 0.3,
                'model': 'AutismCare-Fallback'
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': embeddings is not None,
        'questions_count': len(questions),
        'model_type': 'LLaMA-3-ADI-RAG'
    })

if __name__ == '__main__':
    print("=" * 50)
    print("LLaMA 3 ADI RAG API Server")
    print("=" * 50)
    
    # Load model
    if load_rag_model():
        print("Model loaded successfully!")
    else:
        print("Model not loaded. Will use fallback responses.")
    
    print("\nServer starting on http://localhost:5002")
    print("API endpoints:")
    print("  POST /chat - Chat with the model")
    print("  GET /health - Health check")
    
    app.run(host='0.0.0.0', port=5002, debug=False)