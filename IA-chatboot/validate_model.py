"""
Validate best_vit_model.pth (fine-tuned ViT-B/16 on autism face dataset)
and report accuracy/f1 on a sample from the dataset.
"""
import os, sys, random, json
import torch
import torch.nn as nn
import torchvision
from torchvision import transforms, models
from PIL import Image
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ── paths ───────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR   = os.path.join(BASE_DIR, "image data")
MODEL_PATH = os.path.join(BASE_DIR, "best_vit_model.pth")
AUTISTIC   = os.path.join(DATA_DIR, "Autistic - Copy")
NORMAL     = os.path.join(DATA_DIR, "Non_Autistic - Copy")

# ── model ───────────────────────────────────────────────────────────────
class FineTunedViT(nn.Module):
    def __init__(self):
        super().__init__()
        self.vit = models.vit_b_16(weights=None)
        self.vit.heads.head = nn.Linear(self.vit.heads.head.in_features, 2)

    def forward(self, x):
        return self.vit(x)

device  = torch.device("cpu")
print(f"PyTorch {torch.__version__} | TorchVision {torchvision.__version__}")

model = FineTunedViT()
state = torch.load(MODEL_PATH, map_location=device, weights_only=False)
model.vit.load_state_dict(state)
model.eval()
print("Model loaded OK\n")

# ── transforms ──────────────────────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# ── collect samples ─────────────────────────────────────────────────────
def list_images(folder, label):
    return [(os.path.join(folder, f), label)
            for f in os.listdir(folder)
            if f.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".webp"))]

all_samples = list_images(AUTISTIC, 1) + list_images(NORMAL, 0)
random.seed(42)
random.shuffle(all_samples)

SAMPLE_SIZE = 400                         # use 200 per class for quick eval
samples     = all_samples[:SAMPLE_SIZE]

labels, preds, prob_aut = [], [], []

with torch.no_grad():
    for img_path, lbl in samples:
        try:
            img = Image.open(img_path).convert("RGB")
            t   = transform(img).unsqueeze(0)
            out = model(t)
            p   = torch.softmax(out, dim=1)
            pred = int(torch.argmax(p, dim=1).item())
            preds.append(pred)
            labels.append(lbl)
            prob_aut.append(float(p[0][1].item()))
        except Exception as e:
            print(f"  skip {os.path.basename(img_path)}: {e}")

acc   = accuracy_score(labels, preds)
prec  = precision_score(labels, preds, zero_division=0)
rec   = recall_score(labels,   preds, zero_division=0)
f1    = f1_score(labels,   preds, zero_division=0)

print(f"Validation on {len(labels)} images (200 each class):")
print(f"  Accuracy : {acc:.2%}")
print(f"  Precision: {prec:.2%}")
print(f"  Recall   : {rec:.2%}")
print(f"  F1       : {f1:.2%}")

# Example predictions
print("\nExample predictions on 3 autistic + 3 non-autistic:")
shown = {"autistic": 0, "normal": 0}

for img_path, lbl in samples:
    if lbl == 1 and shown["autistic"] >= 3:
        continue
    if lbl == 0 and shown["normal"]  >= 3:
        continue
    try:
        img = Image.open(img_path).convert("RGB")
        t   = transform(img).unsqueeze(0)
        out = model(t)
        p   = torch.softmax(out, dim=1)
        pred      = int(torch.argmax(p, dim=1).item())
        conf      = float(p[0][pred].item()) * 100
        true_lbl  = "Autistic"      if lbl == 1 else "Non-Autistic"
        pred_lbl  = "Autistic"      if pred == 1 else "Non-Autistic"
        icon      = "✓" if pred == lbl else "✗"
        print(f"  {icon} True={true_lbl:12s}  Predicted={pred_lbl:12s}  Conf={conf:.1f}%  [{os.path.basename(img_path)}]")
        if lbl == 1: shown["autistic"] += 1
        else:         shown["normal"]  += 1
    except:
        pass

# Save metrics file for the API to read
metrics = {
    "accuracy":    round(acc,  4),
    "precision":   round(prec, 4),
    "recall":      round(rec,  4),
    "f1":          round(f1,   4),
    "val_samples": len(labels),
    "model":       "ViT-B/16 (fine-tuned on autism face dataset)",
    "architecture":"vit_b_16",
    "classes":     ["Non-Autistic", "Autistic"],
    "has_metrics": "raw_state_dict"
}
with open(os.path.join(BASE_DIR, "vit_model_metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)
print(f"\nMetrics saved to vit_model_metrics.json")
