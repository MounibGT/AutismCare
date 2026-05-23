import json
import os

print("=== Autism Chatbot System Info ===\n")

# Check ADI data
adi_path = 'adi_questions.json'
if os.path.exists(adi_path):
    with open(adi_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    print(f"✓ ADI Questions: {len(questions)} loaded")
    categories = set(q['category'] for q in questions)
    print(f"  Categories: {categories}")
    print(f"  Languages: EN, FR, AR")
else:
    print("✗ ADI Questions: Not found")

# Check models
models = ['autism_chatbot_improved.joblib', 'vit_weights.pth', 'best_ensemble_0.pth']
for model in models:
    path = f'IA-chatboot/{model}'
    if os.path.exists(path):
        size = os.path.getsize(path) / 1024 / 1024
        print(f"✓ Model: {model} ({size:.2f} MB)")
    else:
        print(f"✗ Model: {model} - Not found")

# Check image data
img_paths = [
    'IA-chatboot/image data - Copy/Autistic - Copy',
    'IA-chatboot/image data - Copy/Non_Autistic - Copy'
]
for path in img_paths:
    if os.path.exists(path):
        count = len([f for f in os.listdir(path) if f.endswith('.jpg')])
        print(f"✓ Images: {path} ({count} images)")
    else:
        print(f"✗ Images: {path} - Not found")

print("\n=== System Ready ===")
print("Run: cd IA-chatboot && python unified_api.py")
print("API: http://localhost:5000")