import os
import torch
import numpy as np
from flask import Flask, render_template, request
from PIL import Image
from model import SimplifiedFIRE

# ---------- Config ----------
UPLOAD_FOLDER = "static/uploads"
MODEL_PATH = "simplified_fire_best.pth"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------- Load Model ----------
model = SimplifiedFIRE()
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# ---------- Image Preprocess ----------
def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((256, 256))
    img = np.array(img) / 255.0
    img = torch.tensor(img).permute(2, 0, 1).float()
    img = img.unsqueeze(0).to(DEVICE)
    return img


# ---------- Routes ----------
@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    confidence = None
    image_path = None

    if request.method == "POST":
        file = request.files["file"]
        if file:
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
            file.save(filepath)
            image_path = filepath

            img_tensor = preprocess_image(filepath)

            with torch.no_grad():
                output = model(img_tensor)
                prob = torch.sigmoid(output).item()

            if prob > 0.5:
                result = "AI Generated"
                confidence = prob * 100
            else:
                result = "Real Image"
                confidence = (1 - prob) * 100

    return render_template(
        "index.html",
        result=result,
        confidence=confidence,
        image_path=image_path
    )


if __name__ == "__main__":
    app.run(debug=True)