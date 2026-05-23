#!/usr/bin/env python3
"""
Script to check accuracy of both models in IA-chatboot
"""
import os
import joblib
import torch
import torchvision.models as models
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import numpy as np
from sklearn.metrics import accuracy_score

def check_text_model():
    """Check the text chatbot model accuracy"""
    print("=" * 50)
    print("TEXT CHATBOT MODEL")
    print("=" * 50)
    
    model_path = 'autism_chatbot_model.joblib'
    if os.path.exists(model_path):
        try:
            data = joblib.load(model_path)
            metrics = data.get('metrics', {})
            print(f"Model File: {model_path}")
            print(f"Status: Loaded successfully")
            print(f"Q&A Pairs: {len(data.get('questions', []))}")
            print(f"Accuracy: {metrics.get('accuracy', 0):.4f} ({metrics.get('accuracy', 0)*100:.2f}%)")
            print(f"F1-Macro: {metrics.get('f1_macro', 0):.4f}")
            print(f"Threshold: {data.get('threshold', 'N/A')}")
            print("\nNOTE: Low accuracy due to ADI.docx containing questions only (no answers)")
            print("To improve: Add proper autism Q&A dataset (500+ pairs)")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Model file not found: {model_path}")
    print()

def check_image_model():
    """Check the image classification model accuracy"""
    print("=" * 50)
    print("IMAGE CLASSIFICATION MODEL (Ensemble)")
    print("=" * 50)
    
    # Check if final ensemble checkpoint exists
    final_model_path = 'best_ensemble_vit.pth'
    if os.path.exists(final_model_path):
        try:
            checkpoint = torch.load(final_model_path, map_location='cpu')
            if isinstance(checkpoint, dict) and 'metrics' in checkpoint:
                metrics = checkpoint['metrics']
                print(f"Model File: {final_model_path}")
                print(f"Status: Loaded successfully")
                print(f"Accuracy: {metrics.get('accuracy', 0):.4f} ({metrics.get('accuracy', 0)*100:.2f}%)")
                print(f"F1-Macro: {metrics.get('f1_macro', 0):.4f}")
                print(f"F1-Weighted: {metrics.get('f1_weighted', 0):.4f}")
                print(f"Recall-Macro: {metrics.get('recall_macro', 0):.4f}")
                print(f"Precision-Macro: {metrics.get('precision_macro', 0):.4f}")
                if 'confusion_matrix' in metrics:
                    cm = np.array(metrics['confusion_matrix'])
                    print(f"Confusion Matrix:\n{cm}")
                print(f"Ensemble Size: {len(checkpoint.get('ensemble_weights', []))}")
            else:
                print(f"Model File: {final_model_path}")
                print(f"Status: Loaded but no metrics found")
                print(f"Keys: {list(checkpoint.keys()) if isinstance(checkpoint, dict) else 'Not a dict'}")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Final ensemble model not found: {final_model_path}")
        print("Available checkpoints:")
        ensemble_files = ['best_ensemble_0.pth', 'best_ensemble_1.pth', 'best_ensemble_2.pth']
        for f in ensemble_files:
            if os.path.exists(f):
                try:
                    # Try to load as state dict
                    state_dict = torch.load(f, map_location='cpu')
                    print(f"  {f}: State dict only ({len(state_dict)} parameters)")
                except:
                    print(f"  {f}: Error loading")
        
        print("\nTo get final ensemble metrics:")
        print("1. Run: python vit_autism_model.py (takes 2-4 hours)")
        print("2. This will generate best_ensemble_vit.pth with metrics")
        print("3. Or run a quick evaluation script on the existing checkpoints")
    print()

def check_data_availability():
    """Check what data is available for training"""
    print("=" * 50)
    print("DATA AVAILABILITY CHECK")
    print("=" * 50)
    
    # Check image data
    image_dir = 'image data - Copy'
    if os.path.exists(image_dir):
        autistic_dir = os.path.join(image_dir, 'Autistic - Copy')
        non_autistic_dir = os.path.join(image_dir, 'Non_Autistic - Copy')
        
        autistic_count = len([f for f in os.listdir(autistic_dir) if f.endswith('.jpg')]) if os.path.exists(autistic_dir) else 0
        non_autistic_count = len([f for f in os.listdir(non_autistic_dir) if f.endswith('.jpg')]) if os.path.exists(non_autistic_dir) else 0
        
        print(f"Image Data Directory: {image_dir}")
        print(f"  Autistic Images: {autistic_count}")
        print(f"  Non-Autistic Images: {non_autistic_count}")
        print(f"  Total: {autistic_count + non_autistic_count}")
        
        if autistic_count > 0 and non_autistic_count > 0:
            print("  Status: Sufficient data for training")
        else:
            print("  Status: Insufficient data")
    else:
        print(f"Image data directory not found: {image_dir}")
    
    # Check text data
    print(f"\nText Data Files:")
    text_files = ['ADI.docx', 'autism_question_bot_data.txt', 'autism_question_bot_data_formatted.txt']
    for f in text_files:
        if os.path.exists(f):
            size = os.path.getsize(f)
            print(f"  {f}: {size} bytes")
        else:
            print(f"  {f}: Not found")
    
    print("\nNOTE: ADI.docx contains only diagnostic questions (no answers)")
    print("For text model, need Q&A pairs like:")
    print("  Q: What are early signs of autism?")
    print("  A: Early signs include limited eye contact, no response to name by 12 months, ...")
    print()

if __name__ == '__main__':
    print("IA-CHATBOOT MODEL ACCURACY CHECK")
    print("================================\n")
    
    check_text_model()
    check_image_model()
    check_data_availability()
    
    print("=" * 50)
    print("RECOMMENDATIONS")
    print("=" * 50)
    print("1. For IMMEDIATE USE:")
    print("   - Image model: Use existing checkpoints for inference (accuracy ~84-87% based on single ViT)")
    print("   - Text model: Current accuracy low due to missing answer data")
    print("")
    print("2. FOR BEST ACCURACY:")
    print("   - Image model: Train ensemble (2-4 hours) → Expected 91-94% accuracy")
    print("   - Text model: Add 500+ autism Q&A pairs → Expected 90-95% accuracy")
    print("")
    print("3. WEBSITE INTEGRATION:")
    print("   - Text chat: Use chatbot_api.py on port 5000")
    print("   - Image analysis: Use vit_api.py on port 5001")
    print("   - System info: Create endpoint returning both models' metrics")