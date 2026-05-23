"""
End-to-end smoke test: POST /api/vit with a real face image.
Requires the Vit server to be running on port 5001.
"""
import base64, json, os, sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
AUTISTIC_IMG_DIR  = os.path.join(os.path.dirname(__file__), "..", "image data", "Autistic - Copy")
NON_AUTISTIC_DIR  = os.path.join(os.path.dirname(__file__), "..", "image data", "Non_Autistic - Copy")

def to_b64(filepath: str) -> str:
    with open(filepath, "rb") as f:
        raw = base64.b64encode(f.read()).decode()
    return f"data:image/jpeg;base64,{raw}"

def post_vit(img_b64: str, question: str = ""):
    data = json.dumps({"image": img_b64, "text": question}).encode()
    req  = urllib.request.Request(f"{BASE}/api/vit", data=data,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())

def main():
    for label, folder in [("Autistic", AUTISTIC_IMG_DIR), ("Non-Autistic", NON_AUTISTIC_DIR)]:
        fname = os.listdir(folder)[0]
        b64   = to_b64(os.path.join(folder, fname))
        result = post_vit(b64)
        print(f"\n{'='*60}")
        print(f"Ground truth : {label}")
        print(f"  prediction : {result.get('prediction')}")
        print(f"  confidence : {result.get('confidence')}%")
        print(f"  probs      : {result.get('probabilities')}")
        print(f"  model      : {result.get('model')}")
        if result.get("analysis"):
            print(f"  analysis   : {result['analysis'][:200]}...")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}")
