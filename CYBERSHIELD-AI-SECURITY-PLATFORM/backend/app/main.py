"""
CyberShield AI - Unified Cyber Risk Detection Platform
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import deepfake, phishing, aml, dashboard, alerts
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🛡️ CyberShield AI Starting Up...")
    logger.info("Loading ML models...")
    
    # Initialize ML models (lazy loading)
    # Models are loaded on first request to reduce startup time
    
    yield
    
    logger.info("🛡️ CyberShield AI Shutting Down...")


app = FastAPI(
    title="CyberShield AI",
    description="""
    ## Unified AI-Based Cyber Risk Detection and Compliance Platform
    
    CyberShield AI provides enterprise-grade cyber threat detection through:
    
    - **Media Authenticity Module**: Deepfake and AI-generated content detection
    - **Phishing Intelligence Module**: URL and email threat analysis
    - **Financial Crime Module**: Anti-money laundering transaction detection
    - **Central Dashboard**: Unified risk scoring and alerts
    
    ### API Modules
    
    - `/api/v1/deepfake` - Deepfake detection endpoints
    - `/api/v1/phishing` - Phishing URL detection endpoints  
    - `/api/v1/aml` - AML transaction analysis endpoints
    - `/api/v1/dashboard` - Dashboard stats and metrics
    - `/api/v1/alerts` - Alert management
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(deepfake.router, prefix="/api/v1/deepfake", tags=["Deepfake Detection"])
app.include_router(phishing.router, prefix="/api/v1/phishing", tags=["Phishing Detection"])
app.include_router(aml.router, prefix="/api/v1/aml", tags=["AML Detection"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "CyberShield AI",
        "version": "1.0.0",
        "description": "Unified AI-Based Cyber Risk Detection Platform",
        "modules": {
            "deepfake": {
                "status": "active",
                "description": "Media authenticity verification"
            },
            "phishing": {
                "status": "active", 
                "description": "URL threat intelligence"
            },
            "aml": {
                "status": "active",
                "description": "Financial crime detection"
            }
        },
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "modules": {
            "deepfake": "operational",
            "phishing": "operational",
            "aml": "operational"
        }
    }

