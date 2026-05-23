"""E2E test: POST /api/vit through Next.js proxy."""
import urllib.request, json, base64, os

BASE = "http://localhost:3000"
A_DIR = r"D:\telechargement\cheminement-main (3)\cheminement-main\cheminement-main\image data\Autistic - Copy"
N_DIR = r"D:\telechargement\cheminement-main (3)\cheminement-main\cheminement-main\image data\Non_Autistic - Copy"


def b64img(folder, idx=0):
    fname = sorted(os.listdir(folder))[idx]
    with open(os.path.join(folder, fname), "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()


for label, folder in [("AUTISTIC[0]", A_DIR), ("NON-AUTISTIC[0]", N_DIR)]:
    b64 = b64img(folder)
    req = urllib.request.Request(
        f"{BASE}/api/vit",
        data=json.dumps({"image": b64}).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read())
            print(
                f"{label}: pred={d.get('prediction')} | conf={d.get('confidence')}% | "
                f"autistic={d.get('probabilities', {}).get('autistic')}% | "
                f"model={d.get('model')}"
            )
            if d.get("analysis"):
                print(" analysis:", d["analysis"][:180])
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:400]
        print(f"{label}: HTTP {e.code} -- {body}")
    except Exception as e:
        print(f"{label}: ERR -- {e}")
