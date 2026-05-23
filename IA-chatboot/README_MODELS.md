# Autism Detection AI Models

## Overview
This project provides two AI models for autism detection:
1. **Llama ChatBot** - Q&A chatbot trained on ADI dataset with Ollama
2. **Vision Transformer** - Image classifier for detecting autism from children photos

---

## Model 1: Llama ChatBot for Autism Q&A

### Installation
1. Install Ollama from https://ollama.com/download
2. Pull models:
   `
   ollama pull llama3
   ollama pull nomic-embed-text
   `

### Usage
`python
python llama_autism_chatbot.py
`

### Features
- Extracts Q&A from ADI.docx
- Trains multiple classifiers (Logistic Regression, Random Forest, SVM)
- Returns comprehensive metrics:
  - Accuracy
  - F1 Score (macro/micro)
  - Recall (macro)
  - Precision (macro)
  - Confusion Matrix

### Output
`
Accuracy: 0.XX
F1 Macro: 0.XX
Recall Macro: 0.XX
Precision Macro: 0.XX
`

---

## Model 2: Vision Transformer (ViT/Swin/DINO) for Autism Detection

### Installation
`ash
pip install -r requirements.txt
`

### Data Structure
`
image data/
  Autistic - Copy/       # Autistic children images
  Non_Autistic - Copy/   # Non-autistic children images
`

### Usage
`python
python vit_autism_model.py
`

### Model Architecture
- **ViT-B/16**: Vision Transformer base model
- **Swin-T**: Swin Transformer tiny variant
- **ResNet-50**: Alternative CNN baseline

### Training Configuration
- Split: 70% train, 10% validation, 20% test
- Optimizer: AdamW
- Learning rate: 1e-4
- Epochs: 50
- Batch size: 32

### Data Augmentation
- Random horizontal flip
- Random rotation (10 degrees)
- Color jitter (brightness, contrast)

### Metrics Returned
- **Accuracy**: Overall classification accuracy
- **F1 Macro**: Harmonic mean of precision/recall (macro average)
- **F1 Weighted**: Weighted by class support
- **Recall Macro**: True positive rate (macro)
- **Precision Macro**: Positive predictive value (macro)
- **Confusion Matrix**: 2x2 matrix for predictions

---

## Improving Accuracy Beyond 90%

### For ChatBot Model
1. Fine-tune with more Q&A pairs
2. Use larger embedding dimension (5000+ features)
3. Add cross-validation
4. Use ensemble of models

### For ViT Image Model
1. **More data**: Collect 1000+ images per class
2. **Better architecture**: 
   - Swin-Large instead of Swin-Tiny
   - Ensemble multiple models
3. **Advanced augmentation**: 
   - AutoAugment
   - MixUp
   - CutMix
4. **Fine-tuning strategies**:
   - Gradual unfreezing
   - Discriminator learning rates
5. **Advanced training**:
   - Label smoothing
   - MixUp regularization
   - Stochastic depth

---

## Expected Results
With proper data (>1000 images/class) and optimizations:
- **ChatBot Accuracy**: 85-95%
- **ViT Accuracy**: 90-98%

**Note**: Autism detection from images is challenging and requires high-quality, diverse datasets. Results depend heavily on data quality and quantity.

---

## Files
- llama_autism_chatbot.py - NLP chatbot model
- it_autism_model.py - Vision transformer model
- 
equirements.txt - Python dependencies
