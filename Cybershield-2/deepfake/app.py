from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
import json
import time
import logging

app = Flask(__name__)
CORS(app)

# Constants
UPLOAD_FOLDER = "uploads"
SAVED_FOLDER = "saved_uploads"
HISTORY_FILE = "history.json"
LOG_FOLDER = "logs"
LOG_FILE = os.path.join(LOG_FOLDER, "prediction.log")

# Ensure required directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SAVED_FOLDER, exist_ok=True)
os.makedirs(LOG_FOLDER, exist_ok=True)

# Load model
model = load_model("ICV3_FINAL.keras")
class_labels = ['Fake', 'Real']

# Setup logging
logging.basicConfig(filename=LOG_FILE, level=logging.INFO,
                    format='%(asctime)s - %(message)s')

# Load or initialize history
if os.path.exists(HISTORY_FILE):
    with open(HISTORY_FILE, "r") as f:
        history = json.load(f)
else:
    history = []

def save_history():
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

def detect_deepfake_icv3(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)[0][0]
    confidence = prediction if prediction > 0.5 else 1 - prediction
    label = class_labels[1] if prediction > 0.5 else class_labels[0]

    return {
        "prediction_confidence": round(float(confidence) * 100, 2),
        "predicted_class": label
    }

@app.route('/predict', methods=['POST'])
def predict():
    if 'images' not in request.files:
        return jsonify({"error": "No images uploaded"}), 400

    images = request.files.getlist("images")
    results = []

    for file in images:
        timestamp = int(time.time() * 1000)
        filename = f"{timestamp}_{file.filename}"
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        saved_path = os.path.join(SAVED_FOLDER, filename)

        file.save(temp_path)
        result = detect_deepfake_icv3(temp_path)
        os.rename(temp_path, saved_path)

        # Prepare result and log
        result_entry = {
            "filename": filename,
            "filepath": f"/image/{filename}",
            "predicted_class": result["predicted_class"],
            "prediction_confidence": result["prediction_confidence"]
        }
        history.append(result_entry)
        results.append(result)

        # Log prediction
        logging.info(f"File: {filename} | Class: {result['predicted_class']} | Confidence: {result['prediction_confidence']}%")

    save_history()
    return jsonify(results)

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify(history)

@app.route('/image/<filename>', methods=['GET'])
def get_image(filename):
    return send_from_directory(SAVED_FOLDER, filename)

@app.route('/logs/<filename>', methods=['GET'])
def get_log_file(filename):
    return send_from_directory(LOG_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
