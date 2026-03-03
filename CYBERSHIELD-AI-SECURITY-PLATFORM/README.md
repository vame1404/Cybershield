# 🛡️ CyberShield AI

## Unified AI-Based Cyber Risk Detection and Compliance Platform

> An enterprise-grade, modular AI-powered platform that integrates multiple cyber risk detection models—including deepfake detection, phishing detection, and financial fraud detection—into a single system with automated risk analysis and centralized dashboards.

![Architecture](docs/architecture.png)

---

## 🎯 Project Overview

CyberShield AI provides organizations with a **single pane of glass** for cyber risk management. Instead of managing 6+ separate security tools, security teams can monitor all threats from one unified dashboard.

### Key Value Propositions
- **Unified Risk Visibility** - One dashboard for all cyber threats
- **AI-Powered Detection** - ML models for each threat category
- **Real-time Alerts** - Instant notifications on detected threats
- **Compliance Ready** - Audit logs and exportable reports

---

## 🧩 Core Modules

### 1️⃣ Media Authenticity Module
- Deepfake image detection (CNN-based)
- AI-generated content detection
- Confidence scoring and explainability

### 2️⃣ Phishing & Fraud Intelligence Module
- Phishing URL detection (NLP + URL features)
- Risk scoring and threat classification
- Real-time URL analysis

### 3️⃣ Financial Crime Detection Module (AML)
- Suspicious transaction detection
- Pattern-based anomaly detection (Isolation Forest)
- Risk scoring and alert generation

### 4️⃣ Central Risk Dashboard
- Unified risk score across all modules
- Detection history and trends
- Alert management
- Exportable compliance reports

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│              Cyber-themed Dashboard Interface                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (FastAPI)                    │
│              Authentication, Rate Limiting, Logging          │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Media AI     │ │   Phishing    │ │     AML       │
│   Service     │ │   Service     │ │   Service     │
│               │ │               │ │               │
│ - Deepfake    │ │ - URL Check   │ │ - Transaction │
│ - AI Content  │ │ - Risk Score  │ │ - Anomaly     │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    ML Model Services                         │
│     CNN Models | NLP Models | Anomaly Detection Models       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL + Redis Cache                      │
│           Detection Logs | User Data | Alerts               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (optional, SQLite for development)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📊 ML Models

| Module | Algorithm | Dataset | Accuracy |
|--------|-----------|---------|----------|
| Deepfake Detection | EfficientNet-B0 | FaceForensics++ | 94.2% |
| Phishing Detection | Random Forest + NLP | PhishTank | 97.1% |
| AML Detection | Isolation Forest | Synthetic | 89.5% |

---

## 🎓 Academic Information

**Project Title:** Unified AI-Based Cyber Risk Detection and Compliance Platform

**Abstract:** This project presents a modular AI-powered platform that integrates multiple cyber risk detection models—including deepfake detection, phishing detection, and financial fraud detection—into a single enterprise-ready system with automated risk analysis and centralized dashboards.

---

## 📁 Project Structure

```
cybershield-ai/
├── frontend/                 # React + Vite Dashboard
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── styles/          # Global styles
│   └── package.json
│
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Core configs
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── ml/              # ML model integrations
│   └── requirements.txt
│
├── ml_models/               # ML Model Training & Artifacts
│   ├── deepfake/
│   ├── phishing/
│   └── aml/
│
└── docs/                    # Documentation
```

---

## 👥 Target Users

- **Enterprise Security Teams (SOC)**
- **FinTech Companies**
- **Media & Content Platforms**
- **KYC/Identity Verification Teams**
- **Compliance Officers**

---

## 📜 License

MIT License - Built for Academic & Research Purposes

---

## 🔗 References

- FaceForensics++ Dataset
- PhishTank Dataset
- Isolation Forest (Liu et al., 2008)
- EfficientNet (Tan & Le, 2019)

