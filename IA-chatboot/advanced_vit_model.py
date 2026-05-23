# Advanced Vision Transformer for Autism Detection - High Accuracy Version
# Techniques to achieve >90% accuracy

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
import torchvision.transforms as transforms
import torchvision.models as models
from pathlib import Path
import numpy as np
from sklearn.metrics import accuracy_score, f1_score, recall_score, precision_score, confusion_matrix
import json
import warnings
warnings.filterwarnings('ignore')

class AdvancedViTAutismModel:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir) / 'image data - Copy'
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f'Using device: {self.device}')
        
    def load_data_with_stratification(self):
        autistic_dir = self.data_dir / 'Autistic - Copy'
        non_autistic_dir = self.data_dir / 'Non_Autistic - Copy'
        
        image_paths = []
        labels = []
        
        if autistic_dir.exists():
            for img_path in list(autistic_dir.glob('*.jpg'))[:1000]:
                image_paths.append(str(img_path))
                labels.append(1)
        
        if non_autistic_dir.exists():
            for img_path in list(non_autistic_dir.glob('*.jpg'))[:1000]:
                image_paths.append(str(img_path))
                labels.append(0)
        
        print(f'Total images: {len(image_paths)}')
        
        from sklearn.model_selection import train_test_split
        train_idx, temp_idx = train_test_split(
            range(len(image_paths)), test_size=0.3, random_state=42, 
            stratify=labels
        )
        val_idx, test_idx = train_test_split(
            temp_idx, test_size=2/3, random_state=42,
            stratify=[labels[i] for i in temp_idx]
        )
        
        self.train_paths = [image_paths[i] for i in train_idx]
        self.val_paths = [image_paths[i] for i in val_idx]
        self.test_paths = [image_paths[i] for i in test_idx]
        self.train_labels = [labels[i] for i in train_idx]
        self.val_labels = [labels[i] for i in val_idx]
        self.test_labels = [labels[i] for i in test_idx]
        
        print(f'Train: {len(self.train_paths)}, Val: {len(self.val_paths)}, Test: {len(self.test_paths)}')
    
    def create_advanced_transforms(self):
        return {
            'train': transforms.Compose([
                transforms.Resize((256, 256)),
                transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomVerticalFlip(p=0.2),
                transforms.RandomRotation(15),
                transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
                transforms.RandomGrayscale(p=0.1),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
                transforms.RandomErasing(p=0.25, scale=(0.02, 0.1))
            ]),
            'val': transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
            ])
        }
    
    def build_ensemble_model(self):
        models_list = []
        model_configs = [
            ('vit', models.vit_b_16(weights='IMAGENET1K_V1')),
            ('resnet', models.resnet50(weights='IMAGENET1K_V1')),
            ('swin', models.swin_b(weights='IMAGENET1K_V1'))  # Use swin_b (Base) instead of swin_t
        ]
        
        for name, model in model_configs:
            if name == 'vit':
                model.heads.head = nn.Linear(model.heads.head.in_features, 2)
            elif name == 'resnet':
                model.fc = nn.Linear(model.fc.in_features, 2)
            elif name == 'swin':
                model.head = nn.Linear(model.head.in_features, 2)
            
            model = model.to(self.device)
            models_list.append(model)
        
        self.models = models_list
        self.ensemble_weights = [0.4, 0.3, 0.3]
        print('Built ensemble of ViT, ResNet, and Swin')
    
    def train_ensemble(self, epochs: int = 100, batch_size: int = 32):
        transforms_dict = self.create_advanced_transforms()
        
        class SimpleDataset(Dataset):
            def __init__(self, paths, labels, transform=None):
                self.paths = paths
                self.labels = labels
                self.transform = transform
            def __len__(self):
                return len(self.paths)
            def __getitem__(self, idx):
                from PIL import Image
                img = Image.open(self.paths[idx]).convert('RGB')
                if self.transform:
                    img = self.transform(img)
                return img, self.labels[idx]
        
        train_dataset = SimpleDataset(self.train_paths, self.train_labels, transforms_dict['train'])
        val_dataset = SimpleDataset(self.val_paths, self.val_labels, transforms_dict['val'])
        
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_dataset, batch_size=batch_size, num_workers=0)
        
        optimizers = [optim.AdamW(model.parameters(), lr=5e-5, weight_decay=1e-4) for model in self.models]
        schedulers = [optim.lr_scheduler.CosineAnnealingWarmRestarts(opt, T_0=10, T_mult=2) for opt in optimizers]
        criterions = [nn.CrossEntropyLoss(label_smoothing=0.1) for _ in self.models]
        
        best_val_acc = 0
        for epoch in range(epochs):
            for model in self.models:
                model.train()
            
            for batch_idx, (images, labels) in enumerate(train_loader):
                images, labels = images.to(self.device), labels.to(self.device)
                
                for i, (model, opt, crit) in enumerate(zip(self.models, optimizers, criterions)):
                    opt.zero_grad()
                    outputs = model(images)
                    loss = crit(outputs, labels)
                    loss.backward()
                    nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                    opt.step()
            
            for sched in schedulers:
                sched.step()
            
            if (epoch + 1) % 20 == 0:
                acc = self.validate(val_loader)
                print(f'Epoch [{epoch+1}/{epochs}], Val Acc: {acc:.4f}')
                if acc > best_val_acc:
                    best_val_acc = acc
                    for i, model in enumerate(self.models):
                        torch.save(model.state_dict(), f'best_model_{i}.pth')
    
    def validate(self, val_loader):
        self.models[0].eval()
        correct, total = 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(self.device), labels.to(self.device)
                outputs = self.models[0](images)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        return correct / total
    
    def evaluate_ensemble(self):
        transforms_dict = self.create_advanced_transforms()
        
        class SimpleDataset(Dataset):
            def __init__(self, paths, labels, transform=None):
                self.paths = paths
                self.labels = labels
                self.transform = transform
            def __len__(self):
                return len(self.paths)
            def __getitem__(self, idx):
                from PIL import Image
                img = Image.open(self.paths[idx]).convert('RGB')
                if self.transform:
                    img = self.transform(img)
                return img, self.labels[idx]
        
        test_dataset = SimpleDataset(self.test_paths, self.test_labels, transforms_dict['val'])
        test_loader = DataLoader(test_dataset, batch_size=32)
        
        all_preds = []
        all_labels = []
        
        for model in self.models:
            model.eval()
        
        with torch.no_grad():
            for images, labels in test_loader:
                images = images.to(self.device)
                ensemble_out = torch.zeros(images.size(0), 2).to(self.device)
                
                for model, weight in zip(self.models, self.ensemble_weights):
                    outputs = model(images)
                    ensemble_out += weight * torch.softmax(outputs, dim=1)
                
                _, predicted = torch.max(ensemble_out, 1)
                all_preds.extend(predicted.cpu().numpy())
                all_labels.extend(labels.numpy())
        
        self.metrics = {
            'accuracy': float(accuracy_score(all_labels, all_preds)),
            'f1_macro': float(f1_score(all_labels, all_preds, average='macro')),
            'f1_weighted': float(f1_score(all_labels, all_preds, average='weighted')),
            'recall_macro': float(recall_score(all_labels, all_preds, average='macro')),
            'precision_macro': float(precision_score(all_labels, all_preds, average='macro')),
            'confusion_matrix': confusion_matrix(all_labels, all_preds).tolist()
        }
        
        print('\n=== Final Test Metrics ===')
        for k, v in self.metrics.items():
            print(f'{k}: {v}')
        
        return self.metrics

def main():
    model = AdvancedViTAutismModel('.')
    model.load_data_with_stratification()
    model.build_ensemble_model()
    model.train_ensemble(epochs=100)
    model.evaluate_ensemble()

if __name__ == '__main__':
    main()
