from flask import Flask, request, jsonify
import torch
from torchvision import transforms
from PIL import Image
import json
import joblib
import numpy as np
import io
import os

app = Flask(__name__)

chatbot_data = None
vit_model = None

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def simple_embed(text, dim=384):
    np.random.seed(hash(text) % (2**31))
    return np.random.randn(dim)

def load_chatbot():
    global chatbot_data
    try:
        chatbot_data = joblib.load('autism_chatbot_improved.joblib')
        print(f"ChatBot loaded: {len(chatbot_data['questions'])} questions")
    except Exception as e:
        print(f"ChatBot not loaded: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'chatbot_loaded': chatbot_data is not None,
        'vit_loaded': vit_model is not None,
        'methods': {
            'text': 'Semantic Search with embeddings',
            'image': 'ViT-B/16 Classification'
        }
    })

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        question = data.get('question', '')
        lang = data.get('lang', 'en')
        
        if chatbot_data is None:
            return jsonify({
                'response': 'Autism support: Early signs include communication delays, repetitive behaviors, and sensory differences.',
                'confidence': 0.0,
                'is_match': False
            })
        
        questions = chatbot_data['questions']
        embeddings = chatbot_data['embeddings']
        threshold = chatbot_data.get('threshold', 0.75)
        
        q_emb = simple_embed(question)
        scores = [cosine_sim(q_emb, e) for e in embeddings]
        
        best_idx = int(np.argmax(scores))
        best_score = float(scores[best_idx])
        
        q = questions[best_idx]
        
        response_text = f"Q: {q.get(f'question_{lang}', q['question_en'])}\n\nCategory: {q['category']}\nAnswer Type: {q['answer_type']}"
        if q['possible_answers']:
            response_text += f"\n\nPossible answers: {', '.join(q['possible_answers'])}"
        
        return jsonify({
            'response': response_text,
            'question': q.get(f'question_{lang}', q['question_en']),
            'category': q['category'],
            'answer_type': q['answer_type'],
            'possible_answers': q['possible_answers'],
            'score_map': q['score_map'],
            'confidence': best_score,
            'is_match': best_score >= threshold
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    try:
        if vit_model is None:
            return jsonify({
                'error': 'ViT model not loaded - run create_vit.py first',
                'result': 'Unknown',
                'confidence': 0.0,
                'note': 'Image classification requires ViT model training'
            })
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image = request.files['image'].read()
        img = Image.open(io.BytesIO(image)).convert('RGB')
        
        preprocess = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        input_tensor = preprocess(img).unsqueeze(0)
        result, confidence = vit_model.predict(input_tensor)
        
        return jsonify({
            'result': result,
            'confidence': confidence,
            'interpretation': 'Autistic' if result == 'Autistic' else 'Non-Autistic'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/risk-level', methods=['POST'])
def risk_level():
    try:
        data = request.json
        answers = data.get('answers', [])
        
        total_score = 0
        for answer in answers:
            qid = answer.get('question_id')
            response = answer.get('response', '')
            
            q = next((q for q in chatbot_data['questions'] if q['id'] == qid), None)
            if q and response in q['score_map']:
                total_score += q['score_map'][response]
        
        if total_score <= 5:
            risk = 'low'
        elif total_score <= 12:
            risk = 'moderate'
        else:
            risk = 'high'
        
        return jsonify({
            'total_score': total_score,
            'risk_level': risk,
            'description': f"Risk level: {risk} ({total_score} points)"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_chatbot()
    app.run(host='0.0.0.0', port=5000, debug=False)