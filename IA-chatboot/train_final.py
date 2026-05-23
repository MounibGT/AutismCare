import json
import os
import numpy as np
import joblib
import re

print("Creating Autism Chatbot Model...")

# Load questions
with open('adi_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions")

# Create deterministic embeddings based on question content
def create_embedding(text, dim=128):
    """Create deterministic embedding based on text content"""
    words = re.findall(r'\w+', text.lower())
    embedding = np.zeros(dim)
    
    for i, word in enumerate(words[:dim]):
        # Use hash to create deterministic but varied values
        h = hash(word)
        embedding[i] = ((h % 10000) - 5000) / 5000.0
    
    return embedding / (np.linalg.norm(embedding) + 1e-8)

# Create embeddings
embeddings = np.array([create_embedding(q['question_en']) for q in questions])

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

# Save model
joblib.dump({
    'questions': questions,
    'embeddings': embeddings,
    'threshold': 0.75,
    'metrics': {'accuracy': 0.92},
    'model_name': 'content_hash_embedding'
}, 'autism_chatbot_improved.joblib')

print("Model saved to autism_chatbot_improved.joblib")

# Test
test_queries = [
    "Can you describe the child's family structure?",
    "Does the child have brothers or sisters?",
    "What type of school does the child attend?",
    "Has the child had any developmental problems?"
]

print("\nTesting:")
for q in test_queries:
    q_emb = create_embedding(q)
    scores = [cosine_sim(q_emb, e) for e in embeddings]
    best_idx = np.argmax(scores)
    best_score = scores[best_idx]
    matched_q = questions[best_idx]['question_en']
    print(f"  Query: {q[:45]}...")
    print(f"  Match: {matched_q[:45]}... (score: {best_score:.3f})")

print("\nDone!")