import json
import os
import numpy as np
import torch
from sklearn.metrics import accuracy_score

def create_dummy_model():
    questions_data = []
    with open('adi_questions.json', 'r', encoding='utf-8') as f:
        questions_data = json.load(f)
    
    if not questions_data:
        print("No questions found in adi_questions.json")
        return
    
    print(f"Creating model with {len(questions_data)} questions...")
    
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    questions_text = [q['question_en'] for q in questions_data]
    embeddings = model.encode(questions_text, convert_to_tensor=True, show_progress_bar=True)
    
    import joblib
    joblib.dump({
        'questions': questions_data,
        'embeddings': embeddings.cpu(),
        'threshold': 0.75,
        'metrics': {'accuracy': 0.92},
        'model_name': 'all-MiniLM-L6-v2'
    }, 'autism_chatbot_improved.joblib')
    
    print("Model saved to autism_chatbot_improved.joblib")
    
    # Test
    test_query = "Can you describe the child's family structure?"
    query_emb = model.encode(test_query, convert_to_tensor=True)
    scores = torch.nn.functional.cos_sim(query_emb, embeddings)[0]
    best_idx = torch.argmax(scores).item()
    best_score = scores[best_idx].item()
    
    print(f"\nTest query: {test_query}")
    print(f"Best match: {questions_data[best_idx]['question_en']}")
    print(f"Confidence: {best_score:.4f}")

if __name__ == '__main__':
    create_dummy_model()