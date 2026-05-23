"""
Quick validation script — loads best_vit_model.pth and prints its metrics.
"""
import torch
import torch.nn as nn
import torchvision
from torchvision import transforms, models
from PIL import Image
import json, io, base64, os

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "best_vit_model.pth")

class EnsembleModel(nn.Module):
    def __init__(self, model_names=None):
        super().__init__()
        self.models = nn.ModuleList()
        self.model_names = model_names or ["swin_b", "vit_b_16", "convnext_tiny"]
        for mname in self.model_names:
            if mname == "swin_b":
                m = models.swin_b(weights=None)
                m.head = nn.Linear(m.head.in_features, 2)
            elif mname == "vit_b_16":
                m = models.vit_b_16(weights=None)
                m.heads.head = nn.Linear(m.heads.head.in_features, 2)
            elif mname == "convnext_tiny":
                m = models.convnext_tiny(weights=None)
                m.classifier[2] = nn.Linear(m.classifier[2].in_features, 2)
            self.models.append(m)

    def forward(self, x):
        outs = [torch.softmax(m(x), dim=1) for m in self.models]
        return torch.stack(outs).mean(dim=0)

def main():
    device = torch.device("cpu")
    print(f"PyTorch {torch.__version__} | TorchVision {torchvision.__version__}")

    ckpt = torch.load(MODEL_PATH, map_location=device, weights_only=False)
    model_names = ckpt.get("model_names", ["swin_b", "vit_b_16", "convnext_tiny"])
    print("Saved model_names:", model_names)

    model = EnsembleModel(model_names)
    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()
    print("Model loaded OK — params:", sum(p.numel() for p in model.parameters()))

    metrics = {
        "val_accuracy":  ckpt.get("val_accuracy"),
        "precision":     ckpt.get("precision"),
        "recall":        ckpt.get("recall"),
        "f1":            ckpt.get("f1"),
        "epoch":         ckpt.get("epoch"),
    }
    print("Saved metrics:", json.dumps(metrics, indent=2))

    # Quick sanity-predict on IA-chatboot/test image if available
    test_img = os.path.join(os.path.dirname(__file__), "test_probe.jpg")
    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    if os.path.exists(test_img):
        img = Image.open(test_img).convert("RGB")
        t = transform(img).unsqueeze(0)
        with torch.no_grad():
            probs = model(t)
        pred = torch.argmax(probs, dim=1).item()
        conf = float(probs[0][pred].item()) * 100
        print(f"\nTest prediction: {'Autistic' if pred else 'Non-Autistic'} ({conf:.1f}% confident)")
    else:
        print("\n(No test_probe.jpg found — model loaded OK, no sanity test image)")

if __name__ == "__main__":
    main()
