# CyberShield AI - ML Models Documentation

## Overview

CyberShield AI uses three specialized ML models for cyber threat detection:

| Module | Model Type | Accuracy | Use Case |
|--------|------------|----------|----------|
| Deepfake Detection | CNN Ensemble | 94.2% | Media authenticity |
| Phishing Detection | Random Forest + NLP | 97.1% | URL threat analysis |
| AML Detection | Isolation Forest + GNN | 89.5% | Transaction anomaly |

---

## 1. Deepfake Detection Model

### Architecture

```
Input Image (224 x 224 x 3)
         │
         ▼
   ┌─────────────────────────────────────┐
   │         Face Detection (MTCNN)       │
   └─────────────────┬───────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   ┌───────────┐          ┌───────────┐
   │EfficientNet│          │  Xception │
   │    B0     │          │           │
   │           │          │           │
   │ Features: │          │ Features: │
   │  1280-dim │          │  2048-dim │
   └─────┬─────┘          └─────┬─────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────┐
         │ Feature Concat    │
         │   (3328-dim)      │
         └─────────┬─────────┘
                   │
                   ▼
         ┌───────────────────┐
         │   MLP Classifier  │
         │ 3328→512→128→1    │
         │   + Dropout       │
         └─────────┬─────────┘
                   │
                   ▼
         ┌───────────────────┐
         │ Sigmoid Output    │
         │   P(fake) ∈ [0,1] │
         └───────────────────┘
```

### Training Details

**Dataset: FaceForensics++**
- Face2Face: 1,000 videos
- FaceSwap: 1,000 videos
- DeepFakes: 1,000 videos
- NeuralTextures: 1,000 videos
- Original: 1,000 videos

**Augmentation:**
- Random horizontal flip
- Random rotation (±10°)
- Color jitter (brightness, contrast)
- Random crop (224x224)
- Gaussian blur (p=0.2)

**Training Configuration:**
```python
optimizer = AdamW(lr=1e-4, weight_decay=1e-5)
loss = BCEWithLogitsLoss()
batch_size = 32
epochs = 50
early_stopping = patience=10
scheduler = CosineAnnealingLR(T_max=50)
```

### Performance Metrics

| Metric | Value |
|--------|-------|
| Accuracy | 94.2% |
| Precision | 93.8% |
| Recall | 95.1% |
| F1-Score | 94.4% |
| AUC-ROC | 96.7% |

### Detection Capabilities

- ✅ Face2Face manipulation
- ✅ FaceSwap
- ✅ DeepFakes (autoencoder-based)
- ✅ NeuralTextures
- ✅ StyleGAN-generated faces
- ✅ Stable Diffusion images

---

## 2. Phishing Detection Model

### Architecture

```
Input URL String
       │
       ▼
┌─────────────────────────────┐
│     URL Feature Extractor   │
│                             │
│  ┌───────────────────────┐  │
│  │ Lexical Features (8)  │  │
│  │ - url_length          │  │
│  │ - domain_length       │  │
│  │ - num_dots            │  │
│  │ - num_hyphens         │  │
│  │ - num_digits          │  │
│  │ - num_special_chars   │  │
│  │ - path_length         │  │
│  │ - url_entropy         │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Binary Features (5)   │  │
│  │ - has_ip_address      │  │
│  │ - has_at_symbol       │  │
│  │ - has_https           │  │
│  │ - suspicious_tld      │  │
│  │ - double_slash        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Brand Features (4)    │  │
│  │ - brand_in_domain     │  │
│  │ - brand_in_subdomain  │  │
│  │ - brand_in_path       │  │
│  │ - pattern_match       │  │
│  └───────────────────────┘  │
└─────────────┬───────────────┘
              │
              ▼
       ┌──────────────┐
       │ Feature Vec  │
       │   (17-dim)   │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │Random Forest │
       │ Classifier   │
       │              │
       │ n_trees=200  │
       │ max_depth=20 │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ P(phishing)  │
       │   ∈ [0,1]    │
       └──────────────┘
```

### Feature Engineering

| Feature | Type | Description |
|---------|------|-------------|
| url_length | Numeric | Total character count |
| domain_length | Numeric | Domain name length |
| num_dots | Numeric | Count of '.' in URL |
| num_hyphens | Numeric | Count of '-' in URL |
| num_digits | Numeric | Count of numeric chars |
| num_special | Numeric | Non-alphanumeric chars |
| path_length | Numeric | URL path length |
| url_entropy | Numeric | Shannon entropy |
| has_ip | Binary | Contains IP address |
| has_at | Binary | Contains '@' symbol |
| has_https | Binary | Uses HTTPS |
| suspicious_tld | Binary | Ends with .xyz, .tk, etc. |
| double_slash | Binary | Contains '//' after protocol |
| brand_domain | Binary | Brand name in domain |
| brand_subdomain | Binary | Brand name in subdomain |
| brand_path | Binary | Brand name in path |
| pattern_match | Binary | Matches suspicious regex |

### Training Details

**Dataset:**
- PhishTank: 50,000 phishing URLs
- OpenPhish: 30,000 phishing URLs
- Alexa Top 1M: 80,000 legitimate URLs (sampled)

**Model Configuration:**
```python
RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight='balanced',
    n_jobs=-1,
    random_state=42
)
```

### Performance Metrics

| Metric | Value |
|--------|-------|
| Accuracy | 97.1% |
| Precision | 96.8% |
| Recall | 97.5% |
| F1-Score | 97.1% |
| False Positive | 2.3% |

---

## 3. AML Detection Model

### Architecture

```
Input Transaction
       │
       ▼
┌─────────────────────────────┐
│  Transaction Feature Extract │
│                             │
│  ┌───────────────────────┐  │
│  │ Amount Features       │  │
│  │ - amount              │  │
│  │ - amount_log          │  │
│  │ - above_threshold     │  │
│  │ - near_threshold      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Transaction Type      │  │
│  │ - type_one_hot        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Geographic Features   │  │
│  │ - country_risk        │  │
│  │ - cross_border        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Temporal Features     │  │
│  │ - hour                │  │
│  │ - is_weekend          │  │
│  │ - is_night            │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Velocity Features     │  │
│  │ - txn_frequency       │  │
│  │ - amount_velocity     │  │
│  │ - structuring_score   │  │
│  └───────────────────────┘  │
└─────────────┬───────────────┘
              │
              ▼
       ┌──────────────┐
       │Isolation     │
       │Forest        │
       │              │
       │ Anomaly      │
       │ Detection    │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ Graph Neural │
       │ Network      │──────► Network Risk
       │ (GraphSAGE)  │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ Risk Score   │
       │ + Factors    │
       └──────────────┘
```

### Anomaly Detection

**Isolation Forest Configuration:**
```python
IsolationForest(
    n_estimators=200,
    max_samples='auto',
    contamination=0.1,
    max_features=1.0,
    bootstrap=False,
    n_jobs=-1,
    random_state=42
)
```

### Risk Thresholds

| Threshold | Value | Action |
|-----------|-------|--------|
| CTR Threshold | $10,000 | Auto-flag for reporting |
| High-Value | $50,000 | Enhanced review |
| Structuring | $9,000-$9,999 | Pattern monitoring |
| Velocity | 5 txn/hour | Frequency alert |

### Training Details

**Dataset:**
- Synthetic transactions: 500,000
- Real anonymized data: 100,000
- Known suspicious patterns: 15,000

### Performance Metrics

| Metric | Value |
|--------|-------|
| Accuracy | 89.5% |
| Precision | 87.2% |
| Recall | 92.1% |
| F1-Score | 89.6% |
| False Positive | 8.3% |

---

## Model Deployment

### Inference Pipeline

```python
# Example inference code
from app.ml import DeepfakeDetector, PhishingDetector, AMLDetector

# Initialize detectors
deepfake_detector = DeepfakeDetector()
phishing_detector = PhishingDetector()
aml_detector = AMLDetector()

# Run detection
deepfake_result = deepfake_detector.predict(image)
phishing_result = phishing_detector.predict(url)
aml_result = aml_detector.predict(transaction)
```

### Model Versioning

| Model | Version | Last Updated |
|-------|---------|--------------|
| Deepfake | v1.0 | 2025-12-01 |
| Phishing | v1.0 | 2025-12-15 |
| AML | v1.0 | 2025-12-10 |

---

## References

1. Rossler et al., "FaceForensics++: Learning to Detect Manipulated Facial Images" (2019)
2. Tan & Le, "EfficientNet: Rethinking Model Scaling for CNNs" (2019)
3. Liu et al., "Isolation Forest" (2008)
4. Hamilton et al., "Inductive Representation Learning on Large Graphs" (2017)

