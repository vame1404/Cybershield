import numpy as np
import tensorflow as tf
from PIL import Image, ImageChops, ImageEnhance
import os

# =========================
# Load Model
# =========================

BASE_DIR = os.getcwd()
MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "tampering_detection_01-03-2026-14-31-10.keras"
)

model = tf.keras.models.load_model(MODEL_PATH)


# =========================
# ELA Conversion
# =========================

def convert_to_ela_image(path, quality=90):

    filename = path
    resaved_filename = "tempresaved.jpg"

    im = Image.open(filename)
    bm = im.convert("RGB")
    im.close()
    im = bm

    im.save(resaved_filename, "JPEG", quality=quality)

    resaved_im = Image.open(resaved_filename)

    ela_im = ImageChops.difference(im, resaved_im)

    extrema = ela_im.getextrema()
    max_diff = max([ex[1] for ex in extrema])

    if max_diff == 0:
        max_diff = 1

    scale = 255.0 / max_diff
    ela_im = ImageEnhance.Brightness(ela_im).enhance(scale)

    return ela_im
def predict_document(image_path):

    ela_image = convert_to_ela_image(image_path, 90)
    ela_image = ela_image.resize((128, 128))

    img = np.array(ela_image) / 255.0
    img = np.expand_dims(img, axis=0)

    prediction = float(model.predict(img)[0][0])

    print("Raw prediction:", prediction)

    threshold = 0.37   # calibrated boundary

    if prediction >= threshold:
        label = "Original Document"
    else:
        label = "Fake Document"

    # distance-based confidence
    confidence = abs(prediction - threshold) / threshold * 100
    confidence = min(confidence, 100)

    return label, round(confidence, 2)
if __name__ == "__main__":

    path = input("Enter image path: ")

    label, confidence = predict_document(path)

    print("\nResult:", label)
    print("Confidence:", confidence, "%")