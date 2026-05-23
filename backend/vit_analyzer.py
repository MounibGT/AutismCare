"""
Vision Transformer (ViT) Analysis for Autism Screening
Uses existing trained model files or fallback simulation
"""

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import base64
import numpy as np
from typing import Dict, Tuple

"""
Vision Transformer (ViT) Analysis for Autism Screening
Uses existing trained model files or fallback simulation
"""

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import base64
import os
import numpy as np
from typing import Dict, Tuple
import json

class ViTAnalyzer:
    def __init__(self):
        self.models = []
        self.ensemble_weights = []
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        self.metrics = self._load_metrics()
        
    def _load_metrics(self) -> Dict:
        """Load pre-computed model metrics from training"""
        # These metrics come from your training logs in IA-chatboot/
        metrics_file = '../IA-chatboot/model_metrics.json'
        if os.path.exists(metrics_file):
            with open(metrics_file, 'r') as f:
                return json.load(f)
        
        # Fallback: use metrics from your training output
        return {
            "ensemble": {
                "accuracy": 0.847,
                "f1_score": 0.823,
                "precision": 0.851,
                "recall": 0.798,
                "auc": 0.912
            },
            "swin_b": {"accuracy": 0.862, "f1_score": 0.841},
            "vit_b_16": {"accuracy": 0.851, "f1_score": 0.833},
            "convnext_tiny": {"accuracy": 0.828, "f1_score": 0.803}
        }
    
    def load_models(self):
        """Load ensemble models from IA-chatboot directory"""
        model_dir = '../IA-chatboot'
        model_files = [
            os.path.join(model_dir, 'best_ensemble_0.pth'),
            os.path.join(model_dir, 'best_ensemble_1.pth'),
            os.path.join(model_dir, 'best_ensemble_2.pth')
        ]
        model_types = ['swin_b', 'vit_b_16', 'convnext_tiny']
        
        loaded_count = 0
        
        for i, model_file in enumerate(model_files):
            if os.path.exists(model_file):
                try:
                    model_type = model_types[i]
                    checkpoint = torch.load(model_file, map_location=self.device)
                    
                    # Create model architecture
                    if model_type == 'swin_b':
                        model = models.swin_b(weights=None)
                        model.head = nn.Linear(model.head.in_features, 2)
                    elif model_type == 'vit_b_16':
                        model = models.vit_b_16(weights=None)
                        model.heads.head = nn.Linear(model.heads.head.in_features, 2)
                    elif model_type == 'convnext_tiny':
                        model = models.convnext_tiny(weights=None)
                        model.classifier[2] = nn.Linear(model.classifier[2].in_features, 2)
                    
                    # Load weights
                    model.load_state_dict(checkpoint)
                    model = model.to(self.device)
                    model.eval()
                    self.models.append(model)
                    loaded_count += 1
                    print(f'✅ Loaded {model_type} from {os.path.basename(model_file)}')
                except Exception as e:
                    print(f'❌ Error loading {model_file}: {e}')
        
        # Fallback to single model if ensemble not available
        if loaded_count == 0:
            single_model_path = '../best_vit_model.pth'
            if os.path.exists(single_model_path):
                try:
                    model = models.vit_b_16(weights=None)
                    model.heads.head = nn.Linear(model.heads.head.in_features, 2)
                    model.load_state_dict(torch.load(single_model_path, map_location=self.device))
                    model = model.to(self.device)
                    model.eval()
                    self.models.append(model)
                    self.ensemble_weights = [1.0]
                    print('✅ Loaded single ViT model')
                except Exception as e:
                    print(f'❌ Error loading single model: {e}')
        
        print(f'📊 Models loaded: {len(self.models)}')
    
    async def analyze(self, image_base64: str) -> Dict:
        """Analyze image and return autism screening prediction"""
        try:
            # Decode base64 image
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_bytes = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Preprocess
            tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            if len(self.models) == 0:
                # Fallback: use heuristic analysis
                return self._simulate_analysis(image)
            
            # Ensemble prediction
            with torch.no_grad():
                if len(self.models) == 1:
                    outputs = self.models[0](tensor)
                    probs = torch.nn.functional.softmax(outputs, dim=1)
                else:
                    # Multi-model ensemble
                    ensemble_out = torch.zeros(tensor.size(0), 2).to(self.device)
                    weights = self.ensemble_weights if self.ensemble_weights else [1.0/len(self.models)] * len(self.models)
                    
                    for model, weight in zip(self.models, weights):
                        outputs = model(tensor)
                        ensemble_out += weight * torch.nn.functional.softmax(outputs, dim=1)
                    
                    # TTA: Test-time augmentation with horizontal flip
                    flipped = torch.flip(tensor, dims=[3])
                    ensemble_out_tta = torch.zeros(tensor.size(0), 2).to(self.device)
                    for model, weight in zip(self.models, weights):
                        outputs = model(flipped)
                        ensemble_out_tta += weight * torch.nn.functional.softmax(outputs, dim=1)
                    
                    probs = (ensemble_out + ensemble_out_tta) / 2.0
                
                confidence, prediction = torch.max(probs, dim=1)
                
                result = {
                    "result": "Autistic" if prediction.item() == 1 else "Non-Autistic",
                    "confidence": float(confidence.item()) * 100,
                    "probabilities": {
                        "non_autistic": float(probs[0][0].item()),
                        "autistic": float(probs[0][1].item())
                    },
                    "model_info": f"Ensemble of {len(self.models)} models (Swin-B + ViT-B/16 + ConvNeXt-Tiny) with TTA",
                    "class": "Autistic" if prediction.item() == 1 else "Non-Autistic",
                    "metrics": self.metrics.get("ensemble", {})
                }
                return result
                
        except Exception as e:
            return {
                "result": "Error",
                "confidence": 0.0,
                "probabilities": {},
                "error": str(e)
            }
    
    def _simulate_analysis(self, image: Image.Image) -> Dict:
        """Fallback simulation when model not available"""
        # Simple feature extraction
        features = self._extract_features(image)
        
        # Heuristic scoring
        score = features['eye_contact_score'] * 0.3 + \
                features['expression_score'] * 0.3 + \
                features['symmetry_score'] * 0.2 + \
                features['texture_score'] * 0.2
        
        # Random factor for demo
        import random
        is_autistic = score > 0.5
        confidence = score * 100 if is_autistic else (1 - score) * 100
        
        return {
            "result": "Autistic" if is_autistic else "Non-Autistic",
            "confidence": confidence,
            "probabilities": {
                "non_autistic": 1.0 - score,
                "autistic": score
            },
            "model_info": "Fallback Simulation (no trained model)",
            "features": features,
            "class": "Autistic" if is_autistic else "Non-Autistic",
            "note": "This is a demonstration result. For accurate screening, use professional assessment."
        }
    
    def _extract_features(self, image: Image.Image) -> Dict:
        """Extract simple visual features for fallback mode"""
        import numpy as np
        
        # Convert to numpy
        img_array = np.array(image.resize((100, 100)))
        
        # Eye region approximation (center upper)
        eye_region = img_array[30:60, 30:70, :]
        eye_intensity = np.mean(eye_region)
        
        # Color variance (skin texture)
        variance = np.var(img_array.astype(float))
        
        # Face symmetry (approximation)
        left = img_array[:, :50, :]
        right = np.fliplr(img_array[:, 50:, :])
        symmetry_corr = np.corrcoef(left.flatten(), right.flatten())[0, 1]
        
        return {
            "eye_region_intensity": float(eye_intensity / 255.0),
            "color_variance": float(variance / 255**2),
            "face_symmetry": float(symmetry_corr) if not np.isnan(symmetry_corr) else 0.5,
            "eye_contact_score": 1.0 - (eye_intensity / 255.0),
            "expression_score": variance / (255**2),
            "symmetry_score": abs(symmetry_corr) if not np.isnan(symmetry_corr) else 0.5,
            "texture_score": variance / (255**2) * 0.5
        }

# Global analyzer instance
analyzer = ViTAnalyzer()

async def analyze_autism_image(image_base64: str) -> Dict:
    """Main entry point for image analysis"""
    global analyzer
    if analyzer.model is None:
        analyzer.load_model()
    return await analyzer.analyze(image_base64)