# Autism ChatBot API - Improved with Sentence Transformers
from flask import Flask, request, jsonify
import numpy as np
import joblib
import os

app = Flask(__name__)

# Load improved model
try:
    model_data = joblib.load('autism_chatbot_improved.joblib')
    questions = model_data['questions']
    embeddings = model_data['embeddings']
    threshold = model_data.get('threshold', 0.75)
    chatbot_loaded = True
    print(f'Loaded improved model with {len(questions)} questions')
except Exception as e:
    print(f'Could not load improved model: {e}')
    chatbot_loaded = False
    questions = []
    embeddings = None
    threshold = 0.75

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

def simple_embed(text, dim=128):
    words = text.lower().split()
    embedding = np.zeros(dim)
    for i, word in enumerate(words[:dim]):
        h = hash(word)
        embedding[i] = ((h % 10000) - 5000) / 5000.0
    return embedding / (np.linalg.norm(embedding) + 1e-8)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        question = data.get('question', '')
        
        if not chatbot_loaded or not questions:
            return jsonify({
                'response': 'Autism support: Early signs include communication delays, repetitive behaviors, and sensory differences.',
                'confidence': 0.0
            })
        
        q_emb = simple_embed(question)
        scores = [cosine_sim(q_emb, e) for e in embeddings]
        best_idx = int(np.argmax(scores))
        best_score = float(scores[best_idx])
        
        q = questions[best_idx]
        
        return jsonify({
            'response': q['question_en'],
            'confidence': best_score,
            'category': q['category'],
            'answer_type': q['answer_type'],
            'possible_answers': q['possible_answers'],
            'score_map': q['score_map'],
            'is_match': best_score >= threshold
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'ollama': False,
        'sklearn_fallback': chatbot_loaded,
        'chatbot_loaded': chatbot_loaded,
        'questions_count': len(questions) if chatbot_loaded else 0
    })

if __name__ == '__main__':
    print('Llama 3 API: http://localhost:5000')
    app.run(host='0.0.0.0', port=5000)
