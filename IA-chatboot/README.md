# Autism Detection Chatbot - IA-chatboot

## System Status

```
============================================================
Autism Chatbot - System Test
============================================================

[1] ADI Data:           [OK] 26 questions loaded
[2] ChatBot Model:      [OK] Model ready (threshold: 0.75)
[3] ViT Image Model:    [X] Requires training (run create_vit.py)
[4] Image Dataset:      [OK] 1470 autistic + 1470 non-autistic images
============================================================
```

## Quick Start

```bash
cd IA-chatboot
pip install -r requirements.txt
python unified_api.py
```

API: http://localhost:5000

## Features

### 1. Text Chatbot
- Multilingual: English, French, Arabic
- Semantic similarity matching
- Confidence scoring
- Risk level assessment

### 2. Image Classification
- ViT-B/16 architecture
- Autistic vs Non-Autistic classification
- Confidence scores

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | System status |
| POST | /chat | Ask autism question |
| POST | /analyze-image | Upload image for classification |
| POST | /risk-level | Calculate risk from answers |

## Example Usage

```bash
# Ask a question
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Can you describe the child family structure?"}'

# Calculate risk level
curl -X POST http://localhost:5000/risk-level \
  -H "Content-Type: application/json" \
  -d '{"answers": [{"question_id": 1, "response": "Normal nuclear family"}]}'
```

## Files Created

| File | Purpose |
|------|---------|
| `adi_questions.json` | Extracted Q&A dataset |
| `autism_chatbot_improved.joblib` | Chatbot model |
| `unified_api.py` | REST API server |
| `vit_predictor.py` | ViT model class |
| `test_system.py` | System diagnostics |

## Risk Scoring

| Level | Score |
|-------|-------|
| Low | 0-5 |
| Moderate | 6-12 |
| High | 13+ |