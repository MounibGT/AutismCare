from flask import Flask, request, jsonify
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import io
import base64
import os

app = Flask(__name__)
models_list = []
device = torch.device('cpu')
ensemble_weights = []

try:
    # IMPROVED: Load ensemble models
    import torchvision.models as models
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'Using device: {device}')
    
    # Load ensemble weights if saved
    if os.path.exists('best_ensemble_vit.pth'):
        checkpoint = torch.load('best_ensemble_vit.pth', map_location=device)
        ensemble_weights = checkpoint.get('ensemble_weights', [0.4, 0.35, 0.25])
    
    # Try loading ensemble models
    model_files = ['best_ensemble_0.pth', 'best_ensemble_1.pth', 'best_ensemble_2.pth']
    model_types = ['swin_b', 'vit_b_16', 'convnext_tiny']
    
    for i, model_file in enumerate(model_files):
        if os.path.exists(model_file):
            model_type = model_types[i]
            if model_type == 'swin_b':
                model = models.swin_b(weights=None)
                model.head = nn.Linear(model.head.in_features, 2)
            elif model_type == 'vit_b_16':
                model = models.vit_b_16(weights=None)
                model.heads.head = nn.Linear(model.heads.head.in_features, 2)
            elif model_type == 'convnext_tiny':
                model = models.convnext_tiny(weights=None)
                model.classifier[2] = nn.Linear(model.classifier[2].in_features, 2)
            
            model.load_state_dict(torch.load(model_file, map_location=device))
            model = model.to(device)
            model.eval()
            models_list.append(model)
            print(f'Loaded ensemble model {i+1}')
    
    if not models_list and os.path.exists('best_vit_model.pth'):
        # Fallback to single model
        model = models.vit_b_16(weights=None)
        model.heads.head = nn.Linear(model.heads.head.in_features, 2)
        model.load_state_dict(torch.load('best_vit_model.pth', map_location=device))
        model = model.to(device)
        model.eval()
        models_list.append(model)
        ensemble_weights = [1.0]
        print('Loaded single ViT model (fallback)')
    elif models_list:
        print(f'Ensemble ready with {len(models_list)} models')
    else:
        print('No trained model found')
        
except Exception as e:
    print(f'Model load error: {e}')
    models_list = []

transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def ensemble_predict(image_tensor):
    """IMPROVED: Ensemble prediction with TTA"""
    with torch.no_grad():
        if len(models_list) == 0:
            return None
        
        if len(models_list) == 1:
            outputs = models_list[0](image_tensor)
            probs = torch.softmax(outputs, dim=1)
            return probs
        
        # Multi-model ensemble with TTA
        ensemble_out = torch.zeros(image_tensor.size(0), 2).to(device)
        
        for model, weight in zip(models_list, ensemble_weights if ensemble_weights else [1.0]*len(models_list)):
            outputs = model(image_tensor)
            ensemble_out += weight * torch.softmax(outputs, dim=1)
        
        # Test-time augmentation: horizontal flip
        image_flipped = torch.flip(image_tensor, dims=[3])
        ensemble_out_tta = torch.zeros(image_tensor.size(0), 2).to(device)
        for model, weight in zip(models_list, ensemble_weights if ensemble_weights else [1.0]*len(models_list)):
            outputs = model(image_flipped)
            ensemble_out_tta += weight * torch.softmax(outputs, dim=1)
        
        final_out = (ensemble_out + ensemble_out_tta) / 2.0
        return final_out

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        tensor = transform(image).unsqueeze(0).to(device)
        
        probs = ensemble_predict(tensor)
        
        if probs is None:
            return jsonify({'error': 'No model loaded'}), 500
        
        pred = torch.argmax(probs, dim=1).item()
        confidence = float(probs[0][pred].item() * 100)
        
        return jsonify({
            'success': True,
            'class': 'Autistic' if pred == 1 else 'Non-Autistic',
            'confidence': confidence,
            'probabilities': {
                'autistic': float(probs[0][1].item()),
                'non_autistic': float(probs[0][0].item())
            },
            'ensemble_size': len(models_list),
            'model_info': 'Improved Ensemble (Swin+ViT+ConvNeXt) with TTA'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'models_loaded': len(models_list),
        'ensemble': len(models_list) > 1,
        'device': str(device)
    })

if __name__ == '__main__':
    print('Improved ViT API: http://localhost:5001')
    print(f'Loaded {len(models_list)} models')
    app.run(host='0.0.0.0', port=5001)
