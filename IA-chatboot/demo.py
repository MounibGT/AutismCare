#!/usr/bin/env python3
"""
Autism Chatbot - Final Demo with System Info
"""
import joblib
import numpy as np
import json
import os

print("=" * 60)
print("Autism Chatbot - System Info")
print("=" * 60)

# Load model
data = joblib.load('autism_chatbot_improved.joblib')
questions = data['questions']
embeddings = data['embeddings']
threshold = data['threshold']
metrics = data['metrics']

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

def create_embedding(text, dim=128):
    words = text.lower().split()
    embedding = np.zeros(dim)
    for i, word in enumerate(words[:dim]):
        h = hash(word)
        embedding[i] = ((h % 10000) - 5000) / 5000.0
    return embedding / (np.linalg.norm(embedding) + 1e-8)

def chat(query, lang='en'):
    q_emb = create_embedding(query)
    scores = [cosine_sim(q_emb, e) for e in embeddings]
    best_idx = np.argmax(scores)
    best_score = scores[best_idx]
    q = questions[best_idx]
    
    return {
        'question': q.get(f'question_{lang}', q['question_en']),
        'category': q['category'],
        'answer_type': q['answer_type'],
        'possible_answers': q['possible_answers'],
        'score_map': q['score_map'],
        'confidence': float(best_score),
        'is_match': best_score >= threshold
    }

# System info
print(f"\n[Model Info]")
print(f"  Questions: {len(questions)}")
print(f"  Threshold: {threshold}")
print(f"  Accuracy: {metrics['accuracy']:.0%}")
print(f"  Categories: {len(set(q['category'] for q in questions))}")

print(f"\n[Image Data]")
autistic_dir = 'image data - Copy/Autistic - Copy'
non_autistic_dir = 'image data - Copy/Non_Autistic - Copy'
if os.path.exists(autistic_dir):
    print(f"  Autistic: {len([f for f in os.listdir(autistic_dir) if f.endswith('.jpg')])} images")
if os.path.exists(non_autistic_dir):
    print(f"  Non-autistic: {len([f for f in os.listdir(non_autistic_dir) if f.endswith('.jpg')])} images")

print(f"\n[Demo]")
demo_queries = [
    "Can you describe the child's family structure?",
    "Does the child have brothers or sisters?",
    "What type of school does the child attend?"
]

for q in demo_queries:
    result = chat(q)
    print(f"\n  Q: {q[:50]}...")
    print(f"  Matched: {result['question'][:50]}...")
    print(f"  Category: {result['category']}")
    print(f"  Confidence: {result['confidence']:.3f}")

print("\n" + "=" * 60)
print("System Ready!")
print("API: python unified_api.py")
print("=" * 60)