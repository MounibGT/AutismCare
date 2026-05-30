"""
vit_server.py — Local inference server for the fine-tuned autism ViT-B/16 model.

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
MODEL_PATH = os.path.join(SCRIPT_DIR, "vit_weights.pth")

# ── model ──────────────────────────────────────────────────────────────
class FineTunedViT(nn.Module):
    def __init__(self):
        super().__init__()
        self.vit = models.vit_b_16(weights=None)
        self.vit.heads.head = nn.Linear(self.vit.heads.head.in_features, 2)

    def forward(self, x):
        return self.vit(x)

device  = torch.device("cpu")
model   = FineTunedViT()
state   = torch.load(MODEL_PATH, map_location=device, weights_only=False)
model.vit.load_state_dict(state)
model.eval()

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
        "model":           "ViT-B/16 (fine-tuned on autism face dataset)",
        "device":          str(device),
        "features": {
            "autistic_non_autistic_classification": True,
            "probability_score": True,
        },
    })

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
        tensor      = transform(image).unsqueeze(0)

        with torch.no_grad():
            probs = torch.softmax(model(tensor), dim=1)

        pred_idx    = int(torch.argmax(probs, dim=1).item())
        confidence  = float(probs[0][pred_idx].item())
        prob_auto   = float(probs[0][1].item())
        prob_normal = float(probs[0][0].item())

        return jsonify({
            "success":      True,
            "prediction":   "Autistic"       if pred_idx == 1 else "Non-Autistic",
            "confidence":   round(confidence * 100, 1),
            "probabilities": {
                "autistic":    round(prob_auto   * 100, 1),
                "non_autistic":round(prob_normal * 100, 1),
            },
            "model": "ViT-B/16 (fine-tuned on autism face dataset)",
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    print(f"ViT inference server starting on http://localhost:5001")
    print(f"Model: vit_weights.pth ({os.path.getsize(MODEL_PATH) // (1024*1024)} MB)")
    print(f"Device: {device}")
    app.run(host="0.0.0.0", port=5001, threaded=True)
