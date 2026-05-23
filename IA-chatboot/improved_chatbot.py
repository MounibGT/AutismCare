import json
import os
import numpy as np
import torch
from sentence_transformers import SentenceTransformer, util
from sklearn.metrics import accuracy_score
import joblib

class AutismChatBot:
    def __init__(self, data_path: str = 'adi_questions.json'):
        self.model_name = 'all-MiniLM-L6-v2'
        self.sentence_model = SentenceTransformer(self.model_name)
        self.questions = []
        self.question_embeddings = None
        self.threshold = 0.75
        self.metrics = {}
        self.load_data(data_path)
    
    def load_data(self, data_path):
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                questions_data = json.load(f)
            
            for q in questions_data:
                self.questions.append(q)
            
            print(f"Loaded {len(self.questions)} questions")
        else:
            print(f"Data file not found: {data_path}")
    
    def encode_questions(self):
        questions_text = [q['question_en'] for q in self.questions]
        self.question_embeddings = self.sentence_model.encode(questions_text, convert_to_tensor=True)
        print(f"Encoded {len(questions_text)} questions")
    
    def train_and_evaluate(self, test_size=0.2, threshold=0.75):
        if self.question_embeddings is None:
            self.encode_questions()
        
        self.threshold = threshold
        n = len(self.questions)
        indices = list(range(n))
        np.random.seed(42)
        np.random.shuffle(indices)
        
        split = int(n * (1 - test_size))
        train_idx = indices[:split]
        test_idx = indices[split:]
        
        correct = 0
        similarities = []
        
        for idx in test_idx:
            query_emb = self.question_embeddings[idx].unsqueeze(0)
            scores = util.cos_sim(query_emb, self.question_embeddings)[0]
            
            sorted_indices, sorted_scores = torch.sort(scores, descending=True)
            
            best_idx = sorted_indices[0].item()
            best_score = sorted_scores[0].item()
            
            if best_idx == idx and len(sorted_indices) > 1:
                best_idx = sorted_indices[1].item()
                best_score = sorted_scores[1].item()
            
            similarities.append(best_score)
            if best_score >= self.threshold:
                correct += 1
        
        accuracy = correct / len(test_idx)
        
        self.metrics = {
            'accuracy': float(accuracy),
            'avg_similarity': float(np.mean(similarities)),
            'threshold': self.threshold,
            'test_size': len(test_idx)
        }
        
        print(f"Accuracy: {accuracy:.2%}")
        return self.metrics
    
    def chat(self, query: str) -> dict:
        if self.question_embeddings is None:
            return {'error': 'Model not trained'}
        
        query_emb = self.sentence_model.encode(query, convert_to_tensor=True)
        scores = util.cos_sim(query_emb, self.question_embeddings)[0]
        
        sorted_indices, sorted_scores = torch.sort(scores, descending=True)
        best_idx = sorted_indices[0].item()
        best_score = sorted_scores[0].item()
        
        q = self.questions[best_idx]
        
        return {
            'question': q['question_en'],
            'category': q['category'],
            'answer_type': q['answer_type'],
            'possible_answers': q['possible_answers'],
            'score_map': q['score_map'],
            'confidence': float(best_score),
            'is_match': best_score >= self.threshold
        }
    
    def save(self, path: str):
        joblib.dump({
            'questions': self.questions,
            'embeddings': self.question_embeddings.cpu() if self.question_embeddings is not None else None,
            'threshold': self.threshold,
            'metrics': self.metrics
        }, path)
    
    def load(self, path: str):
        data = joblib.load(path)
        self.questions = data['questions']
        self.question_embeddings = data['embeddings']
        self.threshold = data.get('threshold', 0.75)
        self.metrics = data.get('metrics', {})


if __name__ == '__main__':
    bot = AutismChatBot()
    if len(bot.questions) > 0:
        bot.encode_questions()
        bot.train_and_evaluate()
        bot.save('autism_chatbot_improved.joblib')
        print("\nTest:")
        print(bot.chat("Can you describe the child's family structure?"))