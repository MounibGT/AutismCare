import torch
import torch.nn as nn
from torchvision import models
import os

print("Creating ViT model...")

class ViTAutismDetector:
    def __init__(self):
        self.device = torch.device('cpu')
        self.model = models.vit_b_16(weights='IMAGENET1K_V1')
        self.model.heads.head = nn.Linear(self.model.heads.head.in_features, 2)
    
    def predict(self, x):
        self.model.eval()
        with torch.no_grad():
            out = self.model(x)
            import torch.nn.functional as F
            prob = F.softmax(out, dim=1)
            pred = torch.argmax(prob, dim=1)
            conf = prob[0, pred].item()
        return 'Autistic' if pred.item() == 1 else 'Non-Autistic', conf

detector = ViTAutismDetector()
torch.save(detector.model.state_dict(), 'vit_weights.pth')
print("ViT model saved to vit_weights.pth")