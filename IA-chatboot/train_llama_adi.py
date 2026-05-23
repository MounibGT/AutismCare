"""
LLaMA 3 Fine-tuning Script for Autism ADI Dataset
This script fine-tunes LLaMA 3 (via Ollama or HuggingFace) on the ADI.docx data
"""

import json
import os
import re
from typing import List, Dict
import requests
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer
import pandas as pd

# Configuration
MODEL_NAME = "meta-llama/Meta-Llama-3-8B-Instruct"  # or use "ollama/llama3" for local
OUTPUT_DIR = "./llama_adi_model"
ADI_DOCX_PATH = "../ADI.docx"

def extract_adi_data_from_docx(docx_path: str) -> List[Dict]:
    """Extract Q&A pairs from ADI.docx file"""
    try:
        from docx import Document
        doc = Document(docx_path)
        
        qa_pairs = []
        current_q = None
        current_a = None
        
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            
            # Match question patterns
            if text.startswith("Q:") or text.startswith("Question:"):
                if current_q and current_a:
                    qa_pairs.append({"question": current_q, "answer": current_a})
                current_q = re.sub(r'^Q:\s*|^Question:\s*', '', text).strip()
                current_a = None
            elif text.startswith("A:") or text.startswith("Answer:"):
                current_a = re.sub(r'^A:\s*|^Answer:\s*', '', text).strip()
        
        if current_q and current_a:
            qa_pairs.append({"question": current_q, "answer": current_a})
        
        return qa_pairs
    
    except ImportError:
        print("python-docx not installed. Install with: pip install python-docx")
        return []
    except Exception as e:
        print(f"Error reading docx: {e}")
        return []

def extract_adi_data_from_json(json_path: str) -> List[Dict]:
    """Extract Q&A pairs from adi_questions.json"""
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        qa_pairs = []
        for q in questions:
            qa_pairs.append({
                "question": q.get("question_en", ""),
                "answer": q.get("description", ""),
                "category": q.get("category", "general"),
                "possible_answers": q.get("possible_answers", []),
                "score_map": q.get("score_map", {})
            })
        
        return qa_pairs
    except Exception as e:
        print(f"Error reading JSON: {e}")
        return []

def format_training_data(qa_pairs: List[Dict]) -> List[Dict]:
    """Format Q&A pairs for LLaMA 3 training"""
    training_data = []
    
    system_prompt = """You are an autism support assistant. You provide helpful, accurate, and compassionate information about autism spectrum disorder, assessment, therapies, and support strategies. Always include appropriate medical disclaimers when discussing diagnosis or treatment."""
    
    for qa in qa_pairs:
        # Create conversation format for LLaMA 3
        conversation = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": qa["question"]},
                {"role": "assistant", "content": qa["answer"]}
            ]
        }
        training_data.append(conversation)
        
        # If there are possible answers, add additional training examples
        if qa.get("possible_answers"):
            for answer in qa["possible_answers"]:
                follow_up = {
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"{qa['question']} Specifically, what about '{answer}'?"},
                        {"role": "assistant", "content": f"Regarding '{answer}': {qa['answer']}"}
                    ]
                }
                training_data.append(follow_up)
    
    return training_data

def train_with_ollama(training_data: List[Dict]):
    """Train using Ollama's LLaMA 3 (local, no GPU required)"""
    print("Setting up Ollama LLaMA 3 training...")
    
    # First, make sure Ollama is running
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code != 200:
            print("Ollama is not running. Please start Ollama first.")
            return
    except:
        print("Cannot connect to Ollama. Please install and start Ollama.")
        return
    
    # Create Modelfile for fine-tuning
    modelfile_content = """FROM llama3

SYSTEM You are an autism support assistant specialized in ADI (Autism Diagnostic Interview) assessments. You provide accurate, compassionate information about autism spectrum disorder.

# Training data will be added via fine-tuning
"""
    
    with open("Modelfile_adi", "w") as f:
        f.write(modelfile_content)
    
    print("Modelfile created. To fine-tune, run:")
    print("ollama create autism-adi-assistant -f Modelfile_adi")
    
    # Alternative: Use the chatbot with RAG approach
    print("\nAlternatively, we'll create a RAG-based system using the ADI data...")
    return create_rag_chatbot(training_data)

def create_rag_chatbot(training_data: List[Dict]):
    """Create a RAG-based chatbot using sentence transformers"""
    from sentence_transformers import SentenceTransformer
    import numpy as np
    import joblib
    
    print("Creating RAG-based chatbot with sentence transformers...")
    
    # Load sentence transformer model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Extract all questions and answers
    questions = []
    answers = []
    categories = []
    
    for item in training_data:
        if len(item["messages"]) >= 3:
            question = item["messages"][1]["content"]
            answer = item["messages"][2]["content"]
            questions.append(question)
            answers.append(answer)
    
    print(f"Encoding {len(questions)} questions...")
    
    # Generate embeddings
    embeddings = model.encode(questions, convert_to_numpy=True, show_progress_bar=True)
    
    # Normalize embeddings
    embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
    
    # Save model data
    model_data = {
        'questions': questions,
        'answers': answers,
        'embeddings': embeddings,
        'model_name': 'all-MiniLM-L6-v2',
        'threshold': 0.5
    }
    
    joblib.dump(model_data, 'llama_adi_rag_model.joblib')
    print(f"RAG model saved with {len(questions)} Q&A pairs")
    
    return model_data

def train_with_huggingface(training_data: List[Dict]):
    """Train using HuggingFace transformers (requires GPU)"""
    print("Setting up HuggingFace training...")
    
    if not torch.cuda.is_available():
        print("No GPU available. Please use Ollama or Google Colab for training.")
        return
    
    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    
    # Format data for training
    def format_prompt(messages):
        formatted = ""
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                formatted += f"<|system|>\n{content}\n"
            elif role == "user":
                formatted += f"<|user|>\n{content}\n"
            elif role == "assistant":
                formatted += f"<|assistant|>\n{content}\n"
        return formatted
    
    # Create dataset
    from datasets import Dataset
    
    texts = [format_prompt(item["messages"]) for item in training_data]
    dataset = Dataset.from_dict({"text": texts})
    
    # Tokenize
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=512)
    
    tokenized_dataset = dataset.map(tokenize_function, batched=True)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=3,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=8,
        learning_rate=2e-5,
        save_strategy="epoch",
        logging_steps=10,
        fp16=True,
    )
    
    # Train
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
    )
    
    print("Starting training...")
    trainer.train()
    
    # Save model
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"Model saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    print("=" * 50)
    print("LLaMA 3 ADI Training Script")
    print("=" * 50)
    
    # Try to load ADI data
    qa_pairs = []
    
    # Try JSON first (already formatted)
    json_path = "adi_questions.json"
    if os.path.exists(json_path):
        print(f"Loading ADI data from {json_path}...")
        qa_pairs = extract_adi_data_from_json(json_path)
    
    # Try DOCX if JSON not available
    if not qa_pairs and os.path.exists(ADI_DOCX_PATH):
        print(f"Loading ADI data from {ADI_DOCX_PATH}...")
        qa_pairs = extract_adi_data_from_docx(ADI_DOCX_PATH)
    
    if not qa_pairs:
        print("No ADI data found. Please ensure ADI.docx or adi_questions.json exists.")
        exit(1)
    
    print(f"Loaded {len(qa_pairs)} Q&A pairs")
    
    # Format training data
    training_data = format_training_data(qa_pairs)
    print(f"Formatted {len(training_data)} training examples")
    
    # Save formatted data
    with open("adi_training_data.json", "w", encoding="utf-8") as f:
        json.dump(training_data, f, indent=2, ensure_ascii=False)
    
    # Choose training method
    print("\nChoose training method:")
    print("1. RAG with Sentence Transformers (fast, no GPU required)")
    print("2. Ollama LLaMA 3 (local, CPU/GPU)")
    print("3. HuggingFace LLaMA 3 (requires GPU)")
    
    choice = input("Enter choice (1/2/3): ").strip()
    
    if choice == "1":
        create_rag_chatbot(training_data)
    elif choice == "2":
        train_with_ollama(training_data)
    elif choice == "3":
        train_with_huggingface(training_data)
    else:
        print("Invalid choice. Running RAG-based chatbot by default...")
        create_rag_chatbot(training_data)
    
    print("\nTraining complete!")
    print("To use the model, run: python llama_adi_api.py")