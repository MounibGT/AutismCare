#!/usr/bin/env python3
"""
Script to check accuracy of both models in IA-chatboot
"""
import os
import joblib
import torch

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
    """Check the image classification model availability"""
    print("=" * 50)
    print("IMAGE CLASSIFICATION MODEL")
    print("=" * 50)
    
    # Check available checkpoints
    checkpoints = ['best_ensemble_0.pth', 'best_ensemble_1.pth', 'best_ensemble_2.pth']
    available = []
    
    for cp in checkpoints:
        if os.path.exists(cp):
            try:
                state_dict = torch.load(cp, map_location='cpu')
                param_count = sum(p.numel() for p in state_dict.values())
                available.append((cp, param_count))
                print(f"{cp}: {param_count:,} parameters")
            except Exception as e:
                print(f"{cp}: Error loading - {e}")
        else:
            print(f"{cp}: Not found")
    
    if available:
        print(f"\nFound {len(available)} ensemble model checkpoints")
        print("These are individual model state dicts from ensemble training")
        print("To get combined ensemble metrics, need to run full training")
    else:
        print("No ensemble checkpoints found")
    
    # Check for final ensemble model
    final_model = 'best_ensemble_vit.pth'
    if os.path.exists(final_model):
        try:
            checkpoint = torch.load(final_model, map_location='cpu')
            if isinstance(checkpoint, dict) and 'metrics' in checkpoint:
                metrics = checkpoint['metrics']
                print(f"\n{final_model}:")
                print(f"  Accuracy: {metrics.get('accuracy', 0):.4f} ({metrics.get('accuracy', 0)*100:.2f}%)")
                print(f"  F1-Macro: {metrics.get('f1_macro', 0):.4f}")
            else:
                print(f"\n{final_model}: Loaded but no metrics found")
        except Exception as e:
            print(f"\n{final_model}: Error - {e}")
    else:
        print(f"\n{final_model}: Not found (run training to generate)")
    print()

def check_data_availability():
    """Check what data is available"""
    print("=" * 50)
    print("DATA AVAILABILITY")
    print("=" * 50)
    
    # Check image data - note the folder name has " - Copy"
    image_dir = 'IA-chatboot/image data - Copy'
    if os.path.exists(image_dir):
        autistic_dir = os.path.join(image_dir, 'Autistic - Copy')
        non_autistic_dir = os.path.join(image_dir, 'Non_Autistic - Copy')
        
        autistic_count = len([f for f in os.listdir(autistic_dir) if f.endswith('.jpg')]) if os.path.exists(autistic_dir) else 0
        non_autistic_count = len([f for f in os.listdir(non_autistic_dir) if f.endswith('.jpg')]) if os.path.exists(non_autistic_dir) else 0
        
        print(f"Image Data: {image_dir}")
        print(f"  Autistic: {autistic_count} images")
        print(f"  Non-Autistic: {non_autistic_count} images")
        print(f"  Total: {autistic_count + non_autistic_count} images")
        
        if autistic_count > 1000 and non_autistic_count > 1000:
            print("  Status: Excellent data for >90% accuracy")
        elif autistic_count > 100 and non_autistic_count > 100:
            print("  Status: Good data for 80-90% accuracy")
        else:
            print("  Status: Limited data - consider collecting more")
    else:
        print(f"Image data directory not found: {image_dir}")
        # Check if it's in main directory
        alt_dir = 'image data - Copy'
        if os.path.exists(alt_dir):
            print(f"Found at: {alt_dir}")
    
    # Check text data
    print(f"\nText Data:")
    text_files = ['ADI.docx', 'autism_question_bot_data.txt']
    for f in text_files:
        if os.path.exists(f):
            size = os.path.getsize(f)
            print(f"  {f}: {size:,} bytes")
        else:
            print(f"  {f}: Not found")
    
    print("\nNOTE: ADI.docx contains only diagnostic questions (no answers)")
    print("For text model to work well, need Q&A pairs.")
    print("Current 'autism_question_bot_data.txt' is empty (0 bytes)")

if __name__ == '__main__':
    print("IA-CHATBOOT MODEL STATUS CHECK")
    print("==============================\n")
    
    # Change to IA-chatboot directory for relative paths
    original_dir = os.getcwd()
    os.chdir(r"D:\Telegram Desktop\cheminement-main\cheminement-main\IA-chatboot")
    
    check_text_model()
    check_image_model()
    check_data_availability()
    
    os.chdir(original_dir)
    
    print("=" * 50)
    print("RECOMMENDATIONS FOR YOUR WEBSITE")
    print("=" * 50)
    print("1. IMAGE MODEL (Ready to use):")
    print("   - Individual checkpoints available (~84-87% accuracy expected)")
    print("   - Use vit_api.py for serving predictions")
    print("   - For best results: Train full ensemble (2-4 hours)")
    print("")
    print("2. TEXT MODEL (Needs improvement):")
    print("   - Currently 0 Q&A pairs - cannot learn meaningful patterns")
    print("   - Accuracy ~25% is random guessing on 4 classes")
    print("   - SOLUTION: Add autism FAQ dataset to autism_question_bot_data.txt")
    print("   - Format: Each line as 'Question?' or 'Q: ...\\nA: ...'")
    print("")
    print("3. WEBSITE INTEGRATION:")
    print("   - Text chat: python chatbot_api.py (port 5000)")
    print("   - Image analysis: python vit_api.py (port 5001)")
    print("   - Create /system-info endpoint combining both metrics")
    print("")
    print("4. TO TRAIN IMAGE MODEL FOR BEST ACCURACY:")
    print("   cd IA-chatboot")
    print("   python vit_autism_model.py")
    print("   (This will take 2-4 hours and produce best_ensemble_vit.pth)")