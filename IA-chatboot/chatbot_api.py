from flask import Flask, request, jsonify
import joblib
import os
import openai
import torch
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer, util
import re

load_dotenv()

app = Flask(__name__)

# IMPROVED: Load sentence transformer model
model_data = {
    'questions': [],
    'answers': [],
    'embeddings': None,
    'threshold': 0.7,
    'related_threshold': 0.35,
    'sentence_model': None
}

try:
    model_file = 'autism_chatbot_improved.joblib' if os.path.exists('autism_chatbot_improved.joblib') else 'autism_chatbot_model.joblib'
    if os.path.exists(model_file):
        data = joblib.load(model_file)
        model_data['questions'] = data.get('questions', [])
        model_data['answers'] = data.get('answers', [])
        model_data['embeddings'] = data.get('embeddings')
        model_data['threshold'] = data.get('threshold', 0.7)
        model_data['related_threshold'] = data.get('related_threshold', 0.35)
        model_data['sentence_model'] = SentenceTransformer('all-MiniLM-L6-v2')
        print(f'Improved ChatBot model loaded successfully from {model_file}')
    else:
        print('Model file not found, using fallback')
except Exception as e:
    print(f'Model load error: {e}')

openai.api_key = os.getenv('OPENAI_API_KEY', '')
if openai.api_key:
    print('OPENAI_API_KEY loaded from environment')
else:
    print('OPENAI_API_KEY not found; GPT fallback will be disabled')

def is_special_non_autism_query(question: str) -> bool:
    """Check if the question is a special non-autism query that should be answered."""
    question_lower = question.lower().strip()
    
    # Thanks words
    thanks_patterns = [
        r'\bthanks\b', r'\bthank you\b', r'\bthx\b', r'\bthank u\b', 
        r'\bthanks a lot\b', r'\bmany thanks\b'
    ]
    
    # Hi/greeting words
    hi_patterns = [
        r'\bhi\b', r'\bhello\b', r'\bhey\b', r'\bgreetings\b', 
        r'\bgood morning\b', r'\bgood afternoon\b', r'\bgood evening\b',
        r'\bhowdy\b', r'\bwhat\'s up\b', r'\bsup\b'
    ]
    
    # Ask for explanation
    explain_patterns = [
        r'\bexplain\b', r'\bwhat does\b.*\bmean\b', r'\bcan you explain\b',
        r'\bwhat is\b.*\bmean\b', r'\bdefinition of\b', r'\bmeanings?\b',
        r'\bclarify\b', r'\bcan you clarify\b'
    ]
    
    # Translation request
    translate_patterns = [
        r'\btranslate\b', r'\bcan you translate\b', r'\btranslate to\b',
        r'\btranslate into\b', r'\bhow do you say\b.*\bin\b',
        r'\bsay in\b', r'\bin \w+ language\b', r'\bin \w+\b'
    ]
    
    # Check all patterns
    all_patterns = thanks_patterns + hi_patterns + explain_patterns + translate_patterns
    for pattern in all_patterns:
        if re.search(pattern, question_lower):
            return True
    
    return False

def get_special_non_autism_response(question: str) -> str:
    """Get a response for special non-autism queries."""
    question_lower = question.lower().strip()
    
    # Thanks words
    if any(re.search(pattern, question_lower) for pattern in [r'\bthanks\b', r'\bthank you\b', r'\bthx\b', r'\bthank u\b']):
        return "You're welcome! Is there anything else I can help you with regarding autism?"
    
    # Hi/greeting words
    if any(re.search(pattern, question_lower) for pattern in [r'\bhi\b', r'\bhello\b', r'\bhey\b', r'\bgreetings\b']):
        return "Hello! I'm here to help with autism-related questions. How can I assist you today?"
    
    # Ask for explanation
    if any(re.search(pattern, question_lower) for pattern in [r'\bexplain\b', r'\bwhat does\b.*\bmean\b', r'\bcan you explain\b']):
        return "I can help explain autism-related concepts. Please ask about autism diagnosis, symptoms, therapies, support strategies, or other autism topics."
    
    # Translation request
    if any(re.search(pattern, question_lower) for pattern in [r'\btranslate\b', r'\bcan you translate\b', r'\btranslate to\b']):
        return "I can help translate autism-related information. Please provide the autism-related text you'd like translated, and specify the target language."
    
    # Default fallback for special queries
    return "I specialize in autism-related topics. Please ask me something about autism diagnosis, symptoms, therapies, or support."

def get_local_adi_answer(question: str):
    if not model_data['sentence_model'] or len(model_data['questions']) == 0:
        return None

    query_embedding = model_data['sentence_model'].encode(question, convert_to_tensor=True)
    embeddings = model_data['embeddings']
    cos_scores = util.cos_sim(query_embedding, embeddings)[0]
    top_results = torch.topk(cos_scores, k=min(3, cos_scores.size(0)))

    best_idx = top_results.indices[0].item()
    best_score = top_results.values[0].item()
    response = model_data['answers'][best_idx]
    matched = False

    if best_score >= model_data['threshold']:
        matched = True
    elif top_results.indices.size(0) > 1:
        second_idx = top_results.indices[1].item()
        second_score = top_results.values[1].item()
        if second_score >= model_data['threshold']:
            best_idx = second_idx
            best_score = second_score
            response = model_data['answers'][best_idx]
            matched = True

    related = best_score >= model_data['related_threshold']
    return {
        'response': response,
        'confidence': float(best_score),
        'matched': matched,
        'related': related,
        'model': 'local-adi-fallback',
        'sources': ['ADI_LOCAL']
    }


def gpt_fallback_answer(question: str):
    if not openai.api_key:
        return None

    system_prompt = (
        "You are a helpful and knowledgeable AI assistant. Answer any question thoroughly and accurately. "
        "You can provide information about autism, health, science, technology, general knowledge, and any other topics. "
        "Be comprehensive and friendly in your responses."
    )
    try:
        completion = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': question}
            ],
            max_tokens=800,
            temperature=0.7
        )
        return completion.choices[0].message['content'].strip()
    except Exception as e:
        print(f'OpenAI fallback error: {e}')
        return None


@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        question = data.get('question', '').strip()

        # Handle empty question
        if not question:
            return jsonify({'response': 'Please ask a question.', 'confidence': 0.0, 'source': 'EMPTY_QUESTION'}), 400

        local_answer = get_local_adi_answer(question)
        if not local_answer:
            return jsonify({'response': 'The chatbot model is not available right now.', 'confidence': 0.0, 'source': 'NO_MODEL'}), 500

        # Try autism-related match first
        if local_answer['matched']:
            # Answer found in ADI
            return jsonify({
                'response': local_answer['response'],
                'confidence': local_answer['confidence'],
                'source': 'ADI_LOCAL'
            })

        # If there's a good match (even if not strong), return it
        if local_answer['related'] and local_answer['confidence'] > 0.35:
            return jsonify({
                'response': local_answer['response'],
                'confidence': local_answer['confidence'],
                'source': 'ADI_LOCAL_RELATED'
            })

        # Not found in ADI, try GPT fallback for ANY question
        gpt_answer = gpt_fallback_answer(question)
        if gpt_answer:
            return jsonify({
                'response': gpt_answer,
                'confidence': 0.0,
                'source': 'OPENAI_GPT'
            })

        # GPT failed, fall back to local answer (low confidence)
        return jsonify({
            'response': local_answer['response'],
            'confidence': local_answer['confidence'],
            'source': 'ADI_LOCAL_FALLBACK'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'model_loaded': model_data['sentence_model'] is not None and len(model_data['questions']) > 0,
        'qa_pairs': len(model_data['questions']),
        'method': 'Sentence Transformer Semantic Search'
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)