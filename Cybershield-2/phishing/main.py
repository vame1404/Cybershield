import os
import pickle
from feature_extraction import extract_features

print("=" * 60)
print("🛡️ CyberShield Phishing Detector")
print("Type 'exit' to quit")
print("=" * 60)

# Load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "XGBoostClassifier.pickle.dat")

with open(model_path, "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully!\n")


def normalize_url(url):
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def classify_url(url):

    url = normalize_url(url)

    features = extract_features(url)

    prediction = model.predict(features)[0]
    probs = model.predict_proba(features)[0]

    phishing_conf = probs[1] * 100

    # 60% threshold rule
    if prediction == 1 and phishing_conf < 60:
        prediction = 0

    label = "🚨 PHISHING / MALICIOUS" if prediction == 1 else "✅ LEGITIMATE / SAFE"

    print("\nResult:")
    print("URL:", url)
    print("Classification:", label)
    print(f"Phishing Confidence: {phishing_conf:.2f}%")
    print("-" * 60)


while True:
    user_url = input("Enter URL to check: ").strip()

    if user_url.lower() == "exit":
        break

    if not user_url:
        continue

    try:
        classify_url(user_url)
    except Exception as e:
        print("Error:", e)