import os
import tensorflow as tf
from PIL import Image

BASE_DIR = r"C:\Users\HP\OneDrive\Desktop\Clg and work\Major-proj\Cybershield-2"

def test_model(path, name):
    print(f"\nTesting {name} at: {path}")
    if not os.path.exists(path):
        print(f"ERROR: {name} file does NOT exist at the path.")
        return
    print(f"File exists. Size: {os.path.getsize(path)} bytes")
    try:
        model = tf.keras.models.load_model(path)
        print(f"SUCCESS: {name} loaded successfully.")
    except Exception as e:
        print(f"FAILED: {name} load fail: {e}")

# Deepfake
df_path = os.path.join(BASE_DIR, "deepfake", "ICV3_FINAL.h5")
test_model(df_path, "Deepfake Model")

# Fake Document
fd_path = os.path.join(BASE_DIR, "fake-document", "document-tampering-detection", "model", "tampering_detection_01-03-2026-14-31-10.h5")
test_model(fd_path, "Fake Document Model")

# AI Generated (Torch)
import torch
sys_fire_path = os.path.join(BASE_DIR, "ai-generated", "simplified_fire_best.pth")
print(f"\nTesting AI Gen Torch at: {sys_fire_path}")
if os.path.exists(sys_fire_path):
    try:
        # We only check if it can be opened
        torch.load(sys_fire_path, map_location='cpu', weights_only=True)
        print("SUCCESS: AI Gen Torch weights loaded (metadata only).")
    except Exception as e:
        print(f"FAILED: AI Gen Torch load fail: {e}")
else:
    print("ERROR: AI Gen Torch file does NOT exist.")
