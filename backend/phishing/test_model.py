import os
import pickle
from feature_extraction import extract_features

print("=" * 60)
print("🛡️ CyberShield Phishing URL Detector")
print("Confidence Threshold: 60%")
print("Type 'exit' to quit")
print("=" * 60)

# Load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "XGBoostClassifier.pickle.dat")

with open(model_path, "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully!\n")


# -----------------------------
# Auto URL Fix
# -----------------------------
def normalize_url(url):
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def classify_url(url):

    url = normalize_url(url)

    features = extract_features(url)

    prediction = model.predict(features)[0]

    confidence = None
    phishing_prob = None

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(features)[0]
        phishing_prob = probs[1] * 100
        confidence = phishing_prob

    # Threshold logic
    final_prediction = prediction

    if prediction == 1 and confidence is not None and confidence < 60:
        final_prediction = 0

    label = "🚨 PHISHING / MALICIOUS" if final_prediction == 1 else "✅ LEGITIMATE / SAFE"

    print("\nResult:")
    print("URL:", url)
    print("Classification:", label)

    if confidence is not None:
        print(f"Phishing Confidence: {phishing_prob:.2f}%")

    print("-" * 60)


# Interactive loop
while True:
    user_url = input("Enter URL to check: ").strip()

    if user_url.lower() == "exit":
        print("Exiting CyberShield detector.")
        break

    if not user_url:
        continue

    try:
        classify_url(user_url)
    except Exception as e:
        print("Error:", e)