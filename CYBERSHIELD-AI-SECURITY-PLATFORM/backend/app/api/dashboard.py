"""
Dashboard API Endpoints
Unified risk metrics and statistics
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime, timedelta
import random

router = APIRouter()


class ModuleStatus(BaseModel):
    name: str
    status: str
    scans: int
    last_active: str


class ThreatTrend(BaseModel):
    date: str
    deepfake: int
    phishing: int
    aml: int


class DashboardStats(BaseModel):
    total_scans: int
    threats_detected: int
    risk_score: float
    active_modules: int
    scan_change: str
    threat_change: str


class RiskDistribution(BaseModel):
    low: int
    medium: int
    high: int


class RecentDetection(BaseModel):
    id: str
    type: str
    item: str
    risk: str
    time: str
    module: str


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get overall dashboard statistics"""
    return DashboardStats(
        total_scans=15847,
        threats_detected=342,
        risk_score=23.5,
        active_modules=4,
        scan_change="+12.5%",
        threat_change="-8.2%"
    )


@router.get("/modules", response_model=List[ModuleStatus])
async def get_module_status():
    """Get status of all detection modules"""
    return [
        ModuleStatus(
            name="Media Authenticity",
            status="active",
            scans=4521,
            last_active="Just now"
        ),
        ModuleStatus(
            name="Phishing Intelligence",
            status="active",
            scans=8934,
            last_active="Just now"
        ),
        ModuleStatus(
            name="Financial Crime (AML)",
            status="active",
            scans=2392,
            last_active="2 min ago"
        ),
        ModuleStatus(
            name="Alert Management",
            status="active",
            scans=15847,
            last_active="Just now"
        )
    ]


@router.get("/trends", response_model=List[ThreatTrend])
async def get_threat_trends():
    """Get weekly threat detection trends"""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [
        ThreatTrend(
            date=day,
            deepfake=random.randint(5, 25),
            phishing=random.randint(10, 35),
            aml=random.randint(3, 15)
        )
        for day in days
    ]


@router.get("/risk-distribution", response_model=RiskDistribution)
async def get_risk_distribution():
    """Get current risk distribution"""
    return RiskDistribution(
        low=65,
        medium=25,
        high=10
    )


@router.get("/recent-detections", response_model=List[RecentDetection])
async def get_recent_detections():
    """Get recent threat detections across all modules"""
    detections = [
        RecentDetection(
            id="DET-001",
            type="Deepfake",
            item="image_2024_001.jpg",
            risk="high",
            time="2 min ago",
            module="Media AI"
        ),
        RecentDetection(
            id="DET-002",
            type="Phishing",
            item="secure-bank-login.net",
            risk="high",
            time="5 min ago",
            module="URL Scanner"
        ),
        RecentDetection(
            id="DET-003",
            type="AML",
            item="TXN-789456123",
            risk="medium",
            time="12 min ago",
            module="Financial"
        ),
        RecentDetection(
            id="DET-004",
            type="Phishing",
            item="paypa1-verify.com",
            risk="high",
            time="18 min ago",
            module="URL Scanner"
        ),
        RecentDetection(
            id="DET-005",
            type="Deepfake",
            item="video_call_rec.mp4",
            risk="medium",
            time="25 min ago",
            module="Media AI"
        ),
    ]
    return detections


@router.get("/unified-risk-score")
async def get_unified_risk_score():
    """Calculate unified risk score across all modules"""
    # Weighted risk calculation
    deepfake_risk = 0.15  # 15% contribution
    phishing_risk = 0.45  # 45% contribution  
    aml_risk = 0.25       # 25% contribution
    
    # Current risk levels (0-1 scale)
    deepfake_current = 0.12
    phishing_current = 0.35
    aml_current = 0.18
    
    unified_score = (
        deepfake_risk * deepfake_current +
        phishing_risk * phishing_current +
        aml_risk * aml_current
    ) * 100
    
    return {
        "unified_risk_score": round(unified_score, 1),
        "risk_level": "low" if unified_score < 30 else "medium" if unified_score < 60 else "high",
        "module_contributions": {
            "deepfake": round(deepfake_current * 100, 1),
            "phishing": round(phishing_current * 100, 1),
            "aml": round(aml_current * 100, 1)
        },
        "trend": "decreasing",
        "last_updated": datetime.utcnow().isoformat()
    }

