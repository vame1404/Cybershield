# 08. FastAPI Monolithic Gateway: Asynchronous Routing of Polymorphic ML Tensors

## Abstract
Deploying heterogeneous Machine Learning backends—comprising PyTorch sequential layers, heavily weighted TensorFlow-Keras residual networks, and classical Scikit-Learn ensembles—presents a complex structural bottleneck. Typically, orchestrations split these engines into extensive Dockerized microservices. The CyberShield platform implements an optimized monolithic API Gateway built on `FastAPI`. Utilizing native asynchronous non-blocking event loops, the gateway securely routes dynamic datatypes (HTTP strings, image byte arrays, and tabular CSV blobs) to strictly synchronized mathematical endpoints while globally managing memory limits via CPU/GPU state switching. 

## I. Framework Utilization
- **Server Hub**: `uvicorn` running `app.py`.
- **Validation**: Strict schema derivations via `Pydantic` `BaseModel`.
- **Asynchronicity**: Core `async / await` I/O blocks prevent heavy neural network predictions from throttling subsequent incoming network requests.

## II. End-to-End API Topology

```mermaid
graph TD
    classDef route fill:#2563eb,stroke:#1d4ed8,color:#fff;
    classDef model fill:#059669,stroke:#047857,color:#fff;
    classDef res fill:#dc2626,stroke:#b91c1c,color:#fff;

    Gateway((FastAPI Interface)) --> Phish[/api/v1/phishing/analyze]:::route
    Gateway --> AI[/api/v1/ai-generated/analyze/image]:::route
    Gateway --> DF[/api/v1/deepfake/analyze/image]:::route
    Gateway --> FD[/api/v1/fake-document/analyze]:::route
    Gateway --> CC[/api/v1/credit-card/analyze/csv]:::route

    Phish --> Pydantic[(String Extractor > Feature Vector)]
    Pydantic --> XGB_Pickle[(XGBoostClassifier.pickle.dat)]:::model
    
    AI --> Torch[(Torch Permute 2,0,1)]
    Torch --> FIRE[(Simplified FIRE .pth)]:::model
    
    DF --> KerasRes[(Pillow Resample > Array Numpy 224x224)]
    KerasRes --> K_IncV3[(ICV3_FINAL.keras)]:::model
    
    FD --> ELA[(ImageChops Compress 90% > Enhance 255.0)]
    ELA --> K_Doc[(Tampering_Detection.h5)]:::model
    
    CC --> Pandas[(Pandas CSV Read > JobLib Feature Scaler)]
    Pandas --> RF_Sk_Learn[(Fraud_Model.pkl)]:::model

    XGB_Pickle --> Output((JSON {is_phishing, score})):::res
    FIRE --> Output
    K_IncV3 --> Output
    K_Doc --> Output
    RF_Sk_Learn --> Output
```

## III. Protocol Implementation
Each endpoint is designed to immediately decode input shapes specific to its mathematical paradigm:

### A. Deep Learning Encoders (Torch / Keras)
Image payloads received exclusively via `Multipart/Form-Data` `UploadFile` lists. `app.py` blocks concurrent loading delays by iteratively calling native `io.BytesIO` streams natively scaling the array limits:
- AI-Generation: 256x256 shape requirements matrix.
- Deepfake: 224x224 standardized bounding box sizes.
- Fake Document Tampering: 128x128 ELA discrepancy mapping.

### B. Statistical Encoders (Sklearn / XGBoost)
URLs bypass disk I/O heavily, natively running purely in runtime RAM executing 16 behavioral scraping checks sequentially. For CSV ingest logs (Credit Card endpoint), Pandas rapidly mounts DataFrames filtering `Class` attributes before vectoring over `cc_scaler.transform()` standard deviations.
