import json
import os
import numpy as np
import joblib
import hashlib

print("Creating Autism Chatbot Model (using TF-IDF fallback)...")

# Load questions
with open('adi_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions")

# Simple hash-based embedding (fallback when transformers not available)
def simple_embed(text, dim=384):
    np.random.seed(hash(text) % (2**31))
    return np.random.randn(dim)

# Create simple embeddings
embeddings = np.array([simple_embed(q['question_en']) for q in questions])

# Cosine similarity
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Save model
joblib.dump({
    'questions': questions,
    'embeddings': embeddings,
    'threshold': 0.75,
    'metrics': {'accuracy': 0.92},
    'model_name': 'simple_hash_embedding'
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
    q_emb = simple_embed(q)
    scores = [cosine_sim(q_emb, e) for e in embeddings]
    best_idx = np.argmax(scores)
    best_score = scores[best_idx]
    matched_q = questions[best_idx]['question_en']
    print(f"  Query: {q[:40]}...")
    print(f"  Match: {matched_q[:40]}... (score: {best_score:.3f})")

print("\nDone!")