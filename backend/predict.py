import joblib
import numpy as np
import os

# Load model using absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "phishing_model.pkl")

model = joblib.load(model_path)


def predict_phishing(features):

    features = np.array(features).reshape(1, -1)

    prediction = model.predict(features)[0]
    confidence = model.predict_proba(features)[0].max()

    if prediction == 1:
        label = "Phishing"
    else:
        label = "Legitimate"

    return label, float(confidence)