from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_phishing

app = FastAPI()


class RequestData(BaseModel):
    features: list


@app.get("/")
def home():
    return {"message": "Phishing API Running"}


@app.post("/detect-phishing")
def detect(data: RequestData):

    label, confidence = predict_phishing(data.features)

    return {
        "prediction": label,
        "confidence": confidence
    }