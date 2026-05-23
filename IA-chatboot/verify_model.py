import joblib
import numpy as np

data = joblib.load('autism_chatbot_improved.joblib')
print('Model loaded successfully')
print(f'Questions: {len(data["questions"])}')
print(f'Threshold: {data["threshold"]}')
print(f'Metrics: {data["metrics"]}')

# Test chat
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def simple_embed(text, dim=384):
    np.random.seed(hash(text) % (2**31))
    return np.random.randn(dim)

test_queries = [
    "Can you describe the child's family structure?",
    "Does the child have brothers or sisters?",
    "What type of school does the child attend?"
]

print('\nTest Results:')
questions = data['questions']
embeddings = data['embeddings']

for q in test_queries:
    q_emb = simple_embed(q)
    scores = [cosine_sim(q_emb, e) for e in embeddings]
    best_idx = np.argmax(scores)
    best_score = scores[best_idx]
    matched_q = questions[best_idx]['question_en']
    print(f'  Query: {q[:50]}...')
    print(f'  Match: {matched_q[:50]}... (score: {best_score:.3f})')