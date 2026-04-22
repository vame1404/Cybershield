import os
import pickle

print("Loading model...")

# Get folder where this script exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(BASE_DIR, "XGBoostClassifier.pickle.dat")

print("Looking for model at:", model_path)

try:
    with open(model_path, "rb") as file:
        xgb_model = pickle.load(file)
    print("Model loaded successfully!")
except FileNotFoundError:
    print("Model file not found. Check filename.")
    exit()