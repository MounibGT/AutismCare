"""
Vision Transformer (ViT) Training Script for Autism Detection
Trains on images of autistic and non-autistic children
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
import numpy as np
from tqdm import tqdm
import json
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt

# Configuration
IMAGE_DATA_PATH = "../image data"  # Path to image dataset
AUTISTIC_FOLDER = "Autistic"
NON_AUTISTIC_FOLDER = "Non_Autistic"
IMAGE_SIZE = 224
BATCH_SIZE = 32
NUM_EPOCHS = 50
LEARNING_RATE = 1e-4
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class AutismDataset(Dataset):
    """Custom dataset for autism face images"""
    
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        label = self.labels[idx]
        
        try:
            image = Image.open(image_path).convert('RGB')
        except Exception as e:
            print(f"Error loading {image_path}: {e}")
            # Return a blank image if loading fails
            image = Image.new('RGB', (IMAGE_SIZE, IMAGE_SIZE))
        
        if self.transform:
            image = self.transform(image)
        
        return image, label

class EnsembleModel(nn.Module):
    """Ensemble of multiple vision models"""
    
    def __init__(self, model_names=['swin_b', 'vit_b_16', 'convnext_tiny']):
        super(EnsembleModel, self).__init__()
        self.models = nn.ModuleList()
        self.model_names = model_names
        
        for model_name in model_names:
            if model_name == 'swin_b':
                model = models.swin_b(weights=models.Swin_B_Weights.IMAGENET1K_V1)
                model.head = nn.Linear(model.head.in_features, 2)
            elif model_name == 'vit_b_16':
                model = models.vit_b_16(weights=models.ViT_B_16_Weights.IMAGENET1K_V1)
                model.heads.head = nn.Linear(model.heads.head.in_features, 2)
            elif model_name == 'convnext_tiny':
                model = models.convnext_tiny(weights=models.ConvNeXt_Tiny_Weights.IMAGENET1K_V1)
                model.classifier[2] = nn.Linear(model.classifier[2].in_features, 2)
            
            self.models.append(model)
    
    def forward(self, x):
        outputs = []
        for model in self.models:
            out = model(x)
            outputs.append(torch.softmax(out, dim=1))
        
        # Average ensemble predictions
        ensemble_out = torch.stack(outputs).mean(dim=0)
        return ensemble_out

def load_image_data(data_path: str):
    """Load images from directory structure"""
    image_paths = []
    labels = []
    
    # Autistic class (label = 1)
    autistic_path = os.path.join(data_path, AUTISTIC_FOLDER)
    if os.path.exists(autistic_path):
        for img_name in os.listdir(autistic_path):
            if img_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.webp')):
                image_paths.append(os.path.join(autistic_path, img_name))
                labels.append(1)
        print(f"Found {len([p for p in image_paths if AUTISTIC_FOLDER in p])} autistic images")
    
    # Non-autistic class (label = 0)
    non_autistic_path = os.path.join(data_path, NON_AUTISTIC_FOLDER)
    if os.path.exists(non_autistic_path):
        for img_name in os.listdir(non_autistic_path):
            if img_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.webp')):
                image_paths.append(os.path.join(non_autistic_path, img_name))
                labels.append(0)
        print(f"Found {len([p for p in image_paths if NON_AUTISTIC_FOLDER in p])} non-autistic images")
    
    return image_paths, labels

def get_transforms():
    """Get data transforms for training and validation"""
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop(IMAGE_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

def train_model(model, train_loader, val_loader, num_epochs=NUM_EPOCHS):
    """Train the model"""
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs)
    
    best_val_accuracy = 0.0
    train_losses = []
    val_accuracies = []
    
    for epoch in range(num_epochs):
        # Training phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        pbar = tqdm(train_loader, desc=f'Epoch {epoch+1}/{num_epochs}')
        for images, labels in pbar:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            pbar.set_postfix({'loss': running_loss / total, 'acc': 100 * correct / total})
        
        train_loss = running_loss / len(train_loader)
        train_losses.append(train_loss)
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        all_labels = []
        all_predictions = []
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
                all_labels.extend(labels.cpu().numpy())
                all_predictions.extend(predicted.cpu().numpy())
        
        val_accuracy = val_correct / val_total
        val_accuracies.append(val_accuracy)
        
        # Calculate additional metrics
        precision = precision_score(all_labels, all_predictions, zero_division=0)
        recall = recall_score(all_labels, all_predictions, zero_division=0)
        f1 = f1_score(all_labels, all_predictions, zero_division=0)
        
        print(f'Epoch {epoch+1}:')
        print(f'  Train Loss: {train_loss:.4f}')
        print(f'  Val Accuracy: {val_accuracy:.4f}')
        print(f'  Precision: {precision:.4f}')
        print(f'  Recall: {recall:.4f}')
        print(f'  F1 Score: {f1:.4f}')
        
        # Save best model
        if val_accuracy > best_val_accuracy:
            best_val_accuracy = val_accuracy
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_accuracy': val_accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'model_names': model.model_names if hasattr(model, 'model_names') else ['vit_b_16']
            }, 'best_vit_autism_model.pth')
            print(f'  ✓ Saved best model with accuracy: {val_accuracy:.4f}')
        
        scheduler.step()
    
    return train_losses, val_accuracies

def test_time_augmentation(model, image_tensor, num_augmentations=5):
    """Apply test-time augmentation for better predictions"""
    model.eval()
    
    with torch.no_grad():
        predictions = []
        
        # Original image
        predictions.append(torch.softmax(model(image_tensor), dim=1))
        
        # Augmented versions
        for _ in range(num_augmentations - 1):
            # Random crop
            augmented = transforms.RandomCrop(IMAGE_SIZE - 20)(image_tensor.squeeze(0)).unsqueeze(0)
            predictions.append(torch.softmax(model(augmented.to(DEVICE)), dim=1))
        
        # Average predictions
        final_prediction = torch.stack(predictions).mean(dim=0)
    
    return final_prediction

def save_model_metrics(metrics):
    """Save model metrics to JSON"""
    with open('vit_model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)

def plot_training_curves(train_losses, val_accuracies):
    """Plot training curves"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    
    ax1.plot(train_losses)
    ax1.set_title('Training Loss')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss')
    
    ax2.plot(val_accuracies)
    ax2.set_title('Validation Accuracy')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Accuracy')
    
    plt.tight_layout()
    plt.savefig('training_curves.png')
    plt.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Vision Transformer Training for Autism Detection")
    print("=" * 50)
    print(f"Using device: {DEVICE}")
    
    # Load image data
    print(f"\nLoading images from {IMAGE_DATA_PATH}...")
    image_paths, labels = load_image_data(IMAGE_DATA_PATH)
    
    if not image_paths:
        print("No images found! Please ensure the image data directory exists.")
        print("Expected structure:")
        print(f"  {IMAGE_DATA_PATH}/")
        print(f"    ├── {AUTISTIC_FOLDER}/")
        print(f"    └── {NON_AUTISTIC_FOLDER}/")
        exit(1)
    
    print(f"Total images: {len(image_paths)}")
    print(f"  Autistic: {sum(labels)}")
    print(f"  Non-autistic: {len(labels) - sum(labels)}")
    
    # Split data
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        image_paths, labels, test_size=0.2, stratify=labels, random_state=42
    )
    
    print(f"\nTrain set: {len(train_paths)} images")
    print(f"Validation set: {len(val_paths)} images")
    
    # Create datasets
    train_transform, val_transform = get_transforms()
    
    train_dataset = AutismDataset(train_paths, train_labels, train_transform)
    val_dataset = AutismDataset(val_paths, val_labels, val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)
    
    # Create model
    print("\nCreating ensemble model...")
    model = EnsembleModel(['swin_b', 'vit_b_16', 'convnext_tiny']).to(DEVICE)
    print(f"Model created with {sum(p.numel() for p in model.parameters()):,} parameters")
    
    # Train
    print("\nStarting training...")
    train_losses, val_accuracies = train_model(model, train_loader, val_loader, NUM_EPOCHS)
    
    # Plot training curves
    plot_training_curves(train_losses, val_accuracies)
    print("\nTraining curves saved to training_curves.png")
    
    # Save final metrics
    metrics = {
        'final_accuracy': val_accuracies[-1] if val_accuracies else 0,
        'best_accuracy': max(val_accuracies) if val_accuracies else 0,
        'epochs': NUM_EPOCHS,
        'batch_size': BATCH_SIZE,
        'learning_rate': LEARNING_RATE,
        'train_samples': len(train_paths),
        'val_samples': len(val_paths),
        'model_architecture': 'Ensemble (Swin-B + ViT-B/16 + ConvNeXt-Tiny)'
    }
    save_model_metrics(metrics)
    
    print("\n" + "=" * 50)
    print("Training Complete!")
    print("=" * 50)
    print(f"Best validation accuracy: {max(val_accuracies):.4f}")
    print("Model saved to: best_vit_autism_model.pth")
    print("Metrics saved to: vit_model_metrics.json")
    print("\nTo use the model, run: python vit_api.py")