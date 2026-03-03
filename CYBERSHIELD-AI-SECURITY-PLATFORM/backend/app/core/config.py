"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "CyberShield AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./cybershield.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # ML Models
    DEEPFAKE_MODEL_PATH: Optional[str] = None
    PHISHING_MODEL_PATH: Optional[str] = None
    AML_MODEL_PATH: Optional[str] = None
    
    # Detection Thresholds
    DEEPFAKE_THRESHOLD: float = 0.7
    PHISHING_THRESHOLD: float = 0.6
    AML_THRESHOLD: float = 0.65
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

