#!/usr/bin/env python3
"""
Quick test of the Autism Chatbot system
"""
import json
import os

def test_system():
    print("=" * 60)
    print("Autism Chatbot - System Test")
    print("=" * 60)
    
    # 1. Check ADI data
    print("\n[1] Checking ADI data...")
    adi_path = 'adi_questions.json'
    if os.path.exists(adi_path):
        with open(adi_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        print(f"    [OK] Loaded {len(questions)} questions")
        print(f"    [OK] Categories: {set(q['category'] for q in questions)}")
    else:
        print(f"    [X] File not found: {adi_path}")
    
    # 2. Check chatbot model
    print("\n[2] Checking ChatBot model...")
    model_path = 'autism_chatbot_improved.joblib'
    if os.path.exists(model_path):
        import joblib
        data = joblib.load(model_path)
        print(f"    [OK] Model loaded: {len(data['questions'])} questions")
        print(f"    [OK] Threshold: {data['threshold']}")
        print(f"    [OK] Metrics: {data.get('metrics', {})}")
    else:
        print(f"    [X] Model not found: {model_path}")
    
    # 3. Check ViT model
    print("\n[3] Checking ViT model...")
    vit_path = 'vit_weights.pth'
    if os.path.exists(vit_path):
        print(f"    [OK] ViT weights found")
    else:
        print(f"    [X] ViT weights not found")
    
    # 4. Check image data
    print("\n[4] Checking image data...")
    autistic_dir = 'image data - Copy/Autistic - Copy'
    non_autistic_dir = 'image data - Copy/Non_Autistic - Copy'
    
    if os.path.exists(autistic_dir):
        autistic_count = len([f for f in os.listdir(autistic_dir) if f.endswith('.jpg')])
        print(f"    [OK] Autistic images: {autistic_count}")
    else:
        print(f"    [X] Autistic images directory not found")
    
    if os.path.exists(non_autistic_dir):
        non_autistic_count = len([f for f in os.listdir(non_autistic_dir) if f.endswith('.jpg')])
        print(f"    [OK] Non-autistic images: {non_autistic_count}")
    else:
        print(f"    [X] Non-autistic images directory not found")
    
    print("\n" + "=" * 60)
    print("System Test Complete")
    print("=" * 60)

if __name__ == '__main__':
    test_system()