"""
vit_server.py — Local inference server for the fine-tuned autism ensemble model.
Uses Swin-B + ViT-B/16 + ConvNeXt-Tiny for higher accuracy and confidence.

Usage:
  python vit_server.py   (listens on http://localhost:5001)

Endpoints
  POST /predict   body: { "image": "<base64>" }   → classification
  GET  /health                                           → status
"""
import io, os, base64, torch, torchvision
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from flask import Flask, request, jsonify

# ── paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENSEMBLE_WEIGHTS_PATH = os.path.join(SCRIPT_DIR, "best_ensemble_vit.pth")
MODEL_FILES = [
    os.path.join(SCRIPT_DIR, "best_ensemble_0.pth"),  # Swin-B
    os.path.join(SCRIPT_DIR, "best_ensemble_1.pth"),  # ViT-B/16  
    os.path.join(SCRIPT_DIR, "best_ensemble_2.pth"),  # ConvNeXt-Tiny
]

# ── Model loading ───────────────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

models_list = []
ensemble_weights = [0.4, 0.35, 0.25]
model_types = ['swin_b', 'vit_b_16', 'convnext_tiny']

# Load ensemble weights if saved
if os.path.exists(ENSEMBLE_WEIGHTS_PATH):
    try:
        checkpoint = torch.load(ENSEMBLE_WEIGHTS_PATH, map_location=device, weights_only=False)
        ensemble_weights = checkpoint.get('ensemble_weights', [0.4, 0.35, 0.25])
    except Exception as e:
        print(f"Could not load ensemble weights, using defaults: {e}")

# Try loading ensemble models
for i, model_file in enumerate(MODEL_FILES):
    if os.path.exists(model_file):
        try:
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
            
            model.load_state_dict(torch.load(model_file, map_location=device, weights_only=False))
            model = model.to(device)
            model.eval()
            models_list.append(model)
            print(f"Loaded {model_type} model")
        except Exception as e:
            print(f"Error loading {model_file}: {e}")

# Fallback to single model if ensemble not fully available
if not models_list:
    MODEL_PATH = os.path.join(SCRIPT_DIR, "vit_weights.pth")
    if os.path.exists(MODEL_PATH):
        class FineTunedViT(nn.Module):
            def __init__(self):
                super().__init__()
                self.vit = models.vit_b_16(weights=None)
                self.vit.heads.head = nn.Linear(self.vit.heads.head.in_features, 2)

            def forward(self, x):
                return self.vit(x)
        
        model = FineTunedViT()
        state = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        model.vit.load_state_dict(state)
        model = model.to(device)
        model.eval()
        models_list.append(model)
        ensemble_weights = [1.0]
        print("Using single ViT model as fallback")

print(f"Loaded {len(models_list)} model(s) for inference")

transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# ── Flask app ──────────────────────────────────────────────────────────
app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":          "ok",
        "model":           "Ensemble (Swin-B + ViT-B/16 + ConvNeXt-Tiny) with TTA",
        "device":          str(device),
        "features": {
            "autistic_non_autistic_classification": True,
            "probability_score": True,
            "ensemble_size": len(models_list),
            "test_time_augmentation": len(models_list) > 1,
        },
    })

def ensemble_predict(image_tensor):
    """Ensemble prediction with Test-Time Augmentation (TTA) for higher confidence"""
    with torch.no_grad():
        if len(models_list) == 0:
            return None, None, None
        
        if len(models_list) == 1:
            outputs = models_list[0](image_tensor)
            probs = torch.softmax(outputs, dim=1)
            pred_idx = int(torch.argmax(probs, dim=1).item())
            confidence = float(probs[0][pred_idx].item())
            return pred_idx, confidence, probs
        
        # Multi-model ensemble with horizontal flip TTA
        ensemble_out = torch.zeros(image_tensor.size(0), 2).to(device)
        
        for model, weight in zip(models_list, ensemble_weights):
            outputs = model(image_tensor)
            ensemble_out += weight * torch.softmax(outputs, dim=1)
        
        # Test-time augmentation: horizontal flip
        image_flipped = torch.flip(image_tensor, dims=[3])
        ensemble_out_tta = torch.zeros(image_tensor.size(0), 2).to(device)
        for model, weight in zip(models_list, ensemble_weights):
            outputs = model(image_flipped)
            ensemble_out_tta += weight * torch.softmax(outputs, dim=1)
        
        # Average original and TTA predictions
        final_out = (ensemble_out + ensemble_out_tta) / 2.0
        
        pred_idx = int(torch.argmax(final_out, dim=1).item())
        confidence = float(final_out[0][pred_idx].item())
        return pred_idx, confidence, final_out

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True, silent=True) or {}
        image_b64 = data.get("image", "")

        # Accept raw base64 or data-URL
        if "," in image_b64:
            image_b64 = image_b64.split(",", 1)[1]

        image_bytes = base64.b64decode(image_b64)
        image       = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor      = transform(image).unsqueeze(0).to(device)

        if len(models_list) == 0:
            return jsonify({
                "success": False,
                "error": "No model loaded",
                "prediction": "Error",
                "confidence": 0.0,
                "probabilities": {"autistic": 0, "non_autistic": 0}
            }), 500

        pred_idx, confidence, probs = ensemble_predict(tensor)

        return jsonify({
            "success":      True,
            "prediction":   "Autistic"       if pred_idx == 1 else "Non-Autistic",
            "confidence":   round(confidence * 100, 1),
            "probabilities": {
                "autistic":    round(probs[0][1].item() * 100, 1),
                "non_autistic":round(probs[0][0].item() * 100, 1),
            },
            "model": f"Ensemble ({len(models_list)} models) with TTA",
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    print(f"ViT inference server starting on http://localhost:5001")
    print(f"Models loaded: {len(models_list)}")
    print(f"Device: {device}")
    app.run(host="0.0.0.0", port=5001, threaded=True)
