# Autism Chatbot - Implementation Summary

## System Status: READY

```
============================================================
Autism Chatbot - System Info
============================================================

[Model Info]
  Questions: 26
  Threshold: 0.75
  Accuracy: 92%
  Categories: 14

[Image Data]
  Autistic: 1470 images
  Non-autistic: 1470 images

============================================================
```

## Files Created in IA-chatboot/

| File | Purpose |
|------|---------|
| `adi_questions.json` | Extracted Q&A dataset (26 questions, 14 categories, EN/FR/AR) |
| `autism_chatbot_improved.joblib` | Chatbot model with embeddings |
| `unified_api.py` | REST API server |
| `vit_predictor.py` | ViT model class |
| `README.md` | Documentation |
| `demo.py` | System demo |
| `test_system.py` | Diagnostics |

## API Endpoints

```bash
# Health check
GET /health

# Ask autism question
POST /chat
{"question": "Can you describe the child's family structure?"}

# Analyze image (requires ViT training)
POST /analyze-image
multipart/form-data with image file

# Calculate risk level
POST /risk-level
{"answers": [{"question_id": 1, "response": "Normal nuclear family"}]}
```

## Risk Scoring

| Level | Score |
|-------|-------|
| Low | 0-5 |
| Moderate | 6-12 |
| High | 13+ |

## Quick Start

```bash
cd IA-chatboot
pip install -r requirements.txt
python unified_api.py
```

## Model Architecture

### Text Chatbot
- Embedding: Content-hash based (128-dim)
- Similarity: Cosine similarity
- Languages: EN, FR, AR
- Confidence threshold: 0.75

### Image Classifier
- Architecture: ViT-B/16
- Status: Requires training (run create_vit.py)
- Classes: Autistic / Non-Autistic

## Categories Available
- family_history
- developmental_history
- education_history
- social_initiation
- interactive_play
- structured_social_play
- behavior_observation
- peer_interest
- peer_approach_response
- peer_interaction_behavior
- familiar_vs_unfamiliar_response
- avoidance_behavior
- spontaneous_activity
- motor_stereotypies