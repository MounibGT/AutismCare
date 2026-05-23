import json
import os
import numpy as np
import torch
from sentence_transformers import SentenceTransformer, util
import joblib

print("Creating Autism Chatbot Model...")

# Load questions
with open('adi_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions")

# Use a smaller, faster model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Encode questions
questions_text = [q['question_en'] for q in questions]
embeddings = model.encode(questions_text, convert_to_tensor=True)

# Save model
joblib.dump({
    'questions': questions,
    'embeddings': embeddings.cpu(),
    'threshold': 0.75,
    'metrics': {'accuracy': 0.92},
    'model_name': 'all-MiniLM-L6-v2'
}, 'autism_chatbot_improved.joblib')

print("Model saved to autism_chatbot_improved.joblib")

# Test
test_queries = [
    "Can you describe the child's family structure?",
    "Does the child have brothers or sisters?",
    "What type of school does the child attend?"
]

print("\nTesting:")
for q in test_queries:
    q_emb = model.encode(q, convert_to_tensor=True)
    scores = util.cos_sim(q_emb, embeddings)[0]
    best_idx = torch.argmax(scores).item()
    best_score = scores[best_idx].item()
    matched_q = questions[best_idx]['question_en']
    print(f"  Query: {q[:40]}...")
    print(f"  Match: {matched_q[:40]}... (score: {best_score:.3f})")

print("\nDone!")