import torch
import torch.nn as nn
from torchvision import models
import torch.nn.functional as F

class ViTAutismDetector:
    def __init__(self, device=None):
        self.device = device or torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.metrics = {}
    
    def build_model(self):
        model = models.vit_b_16(weights='IMAGENET1K_V1')
        model.heads.head = nn.Linear(model.heads.head.in_features, 2)
        self.model = model.to(self.device)
        print(f"Built ViT-B/16 model on {self.device}")
    
    def predict(self, image_tensor):
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first.")
        
        self.model.eval()
        with torch.no_grad():
            image_tensor = image_tensor.to(self.device)
            outputs = self.model(image_tensor)
            probs = F.softmax(outputs, dim=1)
            pred = torch.argmax(probs, dim=1)
            confidence = probs[0, pred].item()
        
        return 'Autistic' if pred.item() == 1 else 'Non-Autistic', confidence
    
    def load_weights(self, path):
        if self.model is None:
            self.build_model()
        self.model.load_state_dict(torch.load(path, map_location=self.device))
        print(f"Loaded weights from {path}")
    
    def save_weights(self, path):
        if self.model is not None:
            torch.save(self.model.state_dict(), path)
            print(f"Saved weights to {path}")