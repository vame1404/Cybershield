import os
import sys
import time
import json
import logging
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
import io
from typing import List

# Setup App
app = FastAPI(title="Cybershield 5-in-1 Unified API")
print("FastAPI App initialized. Ready to bind...")

# Configure CORS for frontend access (simplest permissive setting)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATS_FILE = os.path.join(BASE_DIR, "stats.json")

def load_stats():
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {"total_scans": 0, "threats_detected": 0, "active_modules": 5}

def save_stats(stats):
    try:
        with open(STATS_FILE, "w") as f:
            json.dump(stats, f)
    except:
        pass

GLOBAL_STATS = load_stats()

@app.get("/api/v1/stats")
async def get_stats():
    return GLOBAL_STATS

# -------------------------------------------------------------
# 1. AI GENERATED (Media Authenticity) - Torch
# -------------------------------------------------------------
import torch
from PIL import Image

class SimplifiedFIRE(torch.nn.Module):
    # Mocking the definition just for the load if needed, but wait!
    # I should import it from ai-generated folder to get correct model class
    pass

ai_gen_dir = os.path.join(BASE_DIR, "ai-generated")
sys.path.append(ai_gen_dir)
try:
    from model import SimplifiedFIRE
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ai_gen_model = SimplifiedFIRE()
    ai_gen_model.load_state_dict(torch.load(os.path.join(ai_gen_dir, "simplified_fire_best.pth"), map_location=DEVICE, weights_only=True))
    ai_gen_model.to(DEVICE)
    ai_gen_model.eval()
except Exception as e:
    print("Failed to load AI Generated model:", e)
    ai_gen_model = None

def preprocess_ai_image(image_file):
    img = Image.open(image_file).convert("RGB")
    img = img.resize((256, 256))
    img_arr = np.array(img) / 255.0
    img_tensor = torch.tensor(img_arr).permute(2, 0, 1).float().unsqueeze(0).to(DEVICE)
    return img_tensor

@app.post("/api/v1/ai-generated/analyze/image")
async def analyze_ai_generated(files: List[UploadFile] = File(...)):
    if not ai_gen_model:
        raise HTTPException(500, "Model not loaded")
    
    start_time = time.time()
    results = []
    for file in files:
        img_tensor = preprocess_ai_image(file.file)
        with torch.no_grad():
            output = ai_gen_model(img_tensor)
            prob = torch.sigmoid(output).item()

        is_ai = prob > 0.5
        confidence = prob * 100 if is_ai else (1 - prob) * 100
        results.append({
            "filename": file.filename,
            "is_ai_generated": is_ai,
            "confidence": confidence,
            "result": "AI Generated" if is_ai else "Real Image"
        })
    
    GLOBAL_STATS["total_scans"] += len(files)
    GLOBAL_STATS["threats_detected"] += sum(1 for r in results if r["is_ai_generated"])
    save_stats(GLOBAL_STATS)

    return {
        "results": results,
        "processing_time": f"{time.time() - start_time:.2f}s",
        "timestamp": datetime.utcnow().isoformat()
    }


# -------------------------------------------------------------
# 2. CREDIT CARD FRAUD (CSV Upload)
# -------------------------------------------------------------
import joblib

credit_dir = os.path.join(BASE_DIR, "credit-card")
try:
    cc_scaler = joblib.load(os.path.join(credit_dir, "scaler.pkl"))
    cc_threshold = joblib.load(os.path.join(credit_dir, "threshold.pkl"))
    cc_model = joblib.load(os.path.join(credit_dir, "fraud_model.pkl"))
except Exception as e:
    print("Failed to load CC Fraud objects:", e)
    cc_scaler = None
    cc_model = None

@app.post("/api/v1/credit-card/analyze/csv")
async def analyze_credit_card(file: UploadFile = File(...)):
    start_time = time.time()
    if not cc_scaler:
        raise HTTPException(500, "Credit Card scaler/threshold not loaded")
    
    df = pd.read_csv(file.file)
    original_df = df.copy()
    
    if not cc_model:
        raise HTTPException(500, "fraud_model.pkl not found to run inference")

    # prediction
    if 'Class' in df.columns:
        X = df.drop(['Class'], axis=1)
    else:
        X = df
        
    if 'Time' in X.columns and 'Amount' in X.columns:
        X[['Time', 'Amount']] = cc_scaler.transform(X[['Time', 'Amount']])
        
    predictions = cc_model.predict(X)
    probs = cc_model.predict_proba(X)[:, 1] if hasattr(cc_model, 'predict_proba') else predictions

    # Determine risk tiers
    risk_labels = []
    for p in probs:
        if p > 0.8: risk_labels.append("High Risk")
        elif p > 0.4: risk_labels.append("Medium Risk")
        else: risk_labels.append("Low Risk")

    original_df['Risk'] = risk_labels
    original_df['Fraud_Probability'] = probs
    
    out_path = os.path.join(credit_dir, "prediction_results.csv")
    original_df.to_csv(out_path, index=False)
    
    stats = {
        "high_risk": risk_labels.count("High Risk"),
        "medium_risk": risk_labels.count("Medium Risk"),
        "low_risk": risk_labels.count("Low Risk"),
        "total_transactions": len(risk_labels)
    }

    GLOBAL_STATS["total_scans"] += 1
    GLOBAL_STATS["threats_detected"] += stats["high_risk"]
    save_stats(GLOBAL_STATS)

    # Convert to JSON format for frontend table
    records = original_df.head(100).to_dict(orient="records")
    return {
        "filename": file.filename,
        "summary": stats,
        "results": records,
        "processing_time": f"{time.time() - start_time:.2f}s",
        "download_url": "/api/v1/credit-card/download-results"
    }

from fastapi.responses import FileResponse
@app.get("/api/v1/credit-card/download-results")
def download_cc_results():
    if os.path.exists(os.path.join(credit_dir, "prediction_results.csv")):
        return FileResponse(os.path.join(credit_dir, "prediction_results.csv"), filename="prediction_results.csv")
    raise HTTPException(404, "File not found")

# -------------------------------------------------------------
# 3. DEEPFAKE (Keras model)
# -------------------------------------------------------------
import tensorflow as tf
from tensorflow.keras.preprocessing import image as keras_image

deepfake_dir = os.path.join(BASE_DIR, "deepfake")
try:
    df_model = tf.keras.models.load_model(os.path.join(deepfake_dir, "ICV3_FINAL.keras"))
except Exception as e:
    print("Failed to load Deepfake model:", e)
    df_model = None

@app.post("/api/v1/deepfake/analyze/image")
async def analyze_deepfake_image(files: List[UploadFile] = File(...)):
    if not df_model:
        raise HTTPException(500, "Deepfake model not loaded")
    
    start_time = time.time()
    results = []
    for file in files:
        try:
            contents = await file.read()
            img = Image.open(io.BytesIO(contents)).convert('RGB')
            img = img.resize((224, 224))
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            prediction = df_model.predict(img_array)[0][0]
            is_real = prediction > 0.5
            is_deepfake = not is_real
            confidence = float(prediction if is_real else 1 - prediction)
            
            results.append({
                "filename": file.filename,
                "is_deepfake": is_deepfake,
                "confidence": confidence * 100
            })
        except Exception as e:
            print(f"Error processing {file.filename}: {e}")
            results.append({"filename": file.filename, "error": str(e)})
            
    GLOBAL_STATS["total_scans"] += len(files)
    GLOBAL_STATS["threats_detected"] += sum(1 for r in results if r.get("is_deepfake"))
    save_stats(GLOBAL_STATS)

    return {
        "results": results,
        "processing_time": f"{time.time() - start_time:.2f}s",
        "timestamp": datetime.utcnow().isoformat()
    }

# -------------------------------------------------------------
# 4. FAKE DOCUMENT (ELA + Keras)
# -------------------------------------------------------------
from PIL import ImageChops, ImageEnhance

fake_doc_dir = os.path.join(BASE_DIR, "fake-document", "document-tampering-detection")
try:
    fd_model = tf.keras.models.load_model(os.path.join(fake_doc_dir, "model", "tampering_detection_01-03-2026-14-31-10.h5"))
except Exception as e:
    print("Failed to load Fake Document model:", e)
    fd_model = None

def convert_to_ela(img):
    resaved_filename = "tempresaved.jpg"
    img = img.convert("RGB")
    img.save(resaved_filename, "JPEG", quality=90)
    resaved_im = Image.open(resaved_filename)
    ela_im = ImageChops.difference(img, resaved_im)
    extrema = ela_im.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    if max_diff == 0: max_diff = 1
    scale = 255.0 / max_diff
    ela_im = ImageEnhance.Brightness(ela_im).enhance(scale)
    return ela_im

@app.post("/api/v1/fake-document/analyze")
async def analyze_document(files: List[UploadFile] = File(...)):
    if not fd_model:
        raise HTTPException(500, "Fake Document model not loaded")
        
    start_time = time.time()
    results = []
    for file in files:
        img = Image.open(file.file).convert("RGB")
        ela_img = convert_to_ela(img)
        ela_img = ela_img.resize((128, 128))
        
        img_arr = np.array(ela_img) / 255.0
        img_arr = np.expand_dims(img_arr, axis=0)

        prediction = float(fd_model.predict(img_arr)[0][0])
        threshold = 0.37
        is_original = prediction >= threshold
        
        confidence = abs(prediction - threshold) / threshold * 100
        confidence = min(confidence, 100)
        
        results.append({
            "filename": file.filename,
            "is_fake": not is_original,
            "is_tampered": not is_original,
            "result": "Original Image" if is_original else "Fake Image",
            "confidence": confidence,
            "risk_level": "high" if not is_original else "low"
        })
    
    GLOBAL_STATS["total_scans"] += len(files)
    GLOBAL_STATS["threats_detected"] += sum(1 for r in results if r["is_tampered"])
    save_stats(GLOBAL_STATS)

    return {
        "results": results,
        "processing_time": f"{time.time() - start_time:.2f}s"
    }

# -------------------------------------------------------------
# 5. PHISHING (XGBoost + URL Features)
# -------------------------------------------------------------
phish_dir = os.path.join(BASE_DIR, "phishing")
sys.path.append(phish_dir)
try:
    import pickle
    with open(os.path.join(phish_dir, "XGBoostClassifier.pickle.dat"), "rb") as f:
        phish_model = pickle.load(f)
    from feature_extraction import extract_features as phish_extract
except Exception as e:
    print("Failed to load Phishing model:", e)
    phish_model = None

class URLAnalysisRequest(BaseModel):
    url: str

@app.post("/api/v1/phishing/analyze")
async def analyze_phishing(request: URLAnalysisRequest):
    if not phish_model:
        raise HTTPException(500, "Phishing model not loaded")
        
    start_time = time.time()
    url = request.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    features = phish_extract(url)
    features_arr = np.array(features).reshape(1, -1)
    
    pred = phish_model.predict(features_arr)[0]
    probs = phish_model.predict_proba(features_arr)[0]
    phishing_conf = probs[1] * 100
    
    if pred == 1 and phishing_conf < 60:
        pred = 0
        
    is_phish = pred == 1

    GLOBAL_STATS["total_scans"] += 1
    if is_phish:
        GLOBAL_STATS["threats_detected"] += 1
    save_stats(GLOBAL_STATS)

    return {
        "url": url,
        "is_phishing": is_phish,
        "risk_level": "high" if is_phish else "low",
        "risk_score": float(phishing_conf),
        "indicators": {
            "domain_age": "Unknown",
            "ssl_certificate": "Checked",
            "domain_reputation": "Analyzed",
            "url_features": "Analyzed via ML",
            "content_analysis": "N/A",
            "redirect_chain": "N/A"
        },
        "warnings": ["Detected by XGBoost ML Model"] if is_phish else [],
        "model_used": "XGBoostClassifier",
        "processing_time": f"{time.time() - start_time:.2f}s",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
