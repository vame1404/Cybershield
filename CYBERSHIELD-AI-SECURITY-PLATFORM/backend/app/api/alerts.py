"""
Alert Management API Endpoints
Centralized threat alert system
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import random

router = APIRouter()


class Alert(BaseModel):
    """Alert model"""
    id: str
    type: str  # deepfake, phishing, aml
    title: str
    description: str
    severity: str  # critical, high, medium, low
    status: str  # active, investigating, resolved
    module: str
    created_at: str
    updated_at: Optional[str] = None


class AlertUpdate(BaseModel):
    """Alert update request"""
    status: Optional[str] = None
    notes: Optional[str] = None


class AlertStats(BaseModel):
    """Alert statistics"""
    total: int
    critical: int
    high: int
    medium: int
    low: int
    active: int
    investigating: int
    resolved: int


# In-memory alert storage (would be database in production)
ALERTS_DB = [
    Alert(
        id="ALT-001",
        type="deepfake",
        title="High-confidence deepfake detected",
        description="Image file 'exec_photo.jpg' flagged with 94.2% confidence",
        severity="critical",
        status="active",
        module="Media Authenticity",
        created_at="2 minutes ago"
    ),
    Alert(
        id="ALT-002",
        type="phishing",
        title="Phishing URL blocked",
        description="URL 'secure-bank-verify.net' blocked - mimics banking portal",
        severity="high",
        status="active",
        module="Phishing Detection",
        created_at="5 minutes ago"
    ),
    Alert(
        id="ALT-003",
        type="aml",
        title="Suspicious transaction flagged",
        description="Wire transfer of $75,000 to high-risk jurisdiction",
        severity="high",
        status="investigating",
        module="AML Detection",
        created_at="12 minutes ago"
    ),
    Alert(
        id="ALT-004",
        type="phishing",
        title="Email phishing attempt",
        description="Email from 'support@paypa1.com' flagged as impersonation",
        severity="medium",
        status="resolved",
        module="Phishing Detection",
        created_at="25 minutes ago"
    ),
    Alert(
        id="ALT-005",
        type="deepfake",
        title="AI-generated content detected",
        description="Video call recording shows synthetic artifacts",
        severity="medium",
        status="active",
        module="Media Authenticity",
        created_at="1 hour ago"
    ),
    Alert(
        id="ALT-006",
        type="aml",
        title="Transaction pattern anomaly",
        description="Multiple small transactions detected - potential structuring",
        severity="medium",
        status="investigating",
        module="AML Detection",
        created_at="2 hours ago"
    ),
    Alert(
        id="ALT-007",
        type="phishing",
        title="Malicious redirect detected",
        description="URL redirect chain leads to credential harvesting page",
        severity="critical",
        status="resolved",
        module="Phishing Detection",
        created_at="3 hours ago"
    ),
    Alert(
        id="ALT-008",
        type="deepfake",
        title="Face swap detected in document",
        description="ID document photo shows manipulation artifacts",
        severity="high",
        status="resolved",
        module="Media Authenticity",
        created_at="4 hours ago"
    ),
]


@router.get("/", response_model=List[Alert])
async def get_alerts(
    type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50
):
    """
    Get all alerts with optional filtering
    
    - **type**: Filter by alert type (deepfake, phishing, aml)
    - **severity**: Filter by severity (critical, high, medium, low)
    - **status**: Filter by status (active, investigating, resolved)
    - **limit**: Maximum number of alerts to return
    """
    alerts = ALERTS_DB.copy()
    
    if type:
        alerts = [a for a in alerts if a.type == type]
    if severity:
        alerts = [a for a in alerts if a.severity == severity]
    if status:
        alerts = [a for a in alerts if a.status == status]
    
    return alerts[:limit]


@router.get("/stats", response_model=AlertStats)
async def get_alert_stats():
    """Get alert statistics summary"""
    alerts = ALERTS_DB
    
    return AlertStats(
        total=len(alerts),
        critical=sum(1 for a in alerts if a.severity == "critical"),
        high=sum(1 for a in alerts if a.severity == "high"),
        medium=sum(1 for a in alerts if a.severity == "medium"),
        low=sum(1 for a in alerts if a.severity == "low"),
        active=sum(1 for a in alerts if a.status == "active"),
        investigating=sum(1 for a in alerts if a.status == "investigating"),
        resolved=sum(1 for a in alerts if a.status == "resolved")
    )


@router.get("/{alert_id}", response_model=Alert)
async def get_alert(alert_id: str):
    """Get a specific alert by ID"""
    for alert in ALERTS_DB:
        if alert.id == alert_id:
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")


@router.patch("/{alert_id}")
async def update_alert(alert_id: str, update: AlertUpdate):
    """
    Update alert status or add notes
    
    - **status**: New status (active, investigating, resolved)
    - **notes**: Additional notes for the alert
    """
    for i, alert in enumerate(ALERTS_DB):
        if alert.id == alert_id:
            if update.status:
                ALERTS_DB[i] = Alert(
                    **{**alert.dict(), "status": update.status, "updated_at": datetime.utcnow().isoformat()}
                )
            return {"message": "Alert updated successfully", "alert": ALERTS_DB[i]}
    raise HTTPException(status_code=404, detail="Alert not found")


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str):
    """Delete an alert"""
    global ALERTS_DB
    initial_length = len(ALERTS_DB)
    ALERTS_DB = [a for a in ALERTS_DB if a.id != alert_id]
    
    if len(ALERTS_DB) == initial_length:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert deleted successfully"}


@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Mark an alert as resolved"""
    return await update_alert(alert_id, AlertUpdate(status="resolved"))


@router.get("/summary/by-module")
async def get_alerts_by_module():
    """Get alert count grouped by module"""
    alerts = ALERTS_DB
    
    return {
        "deepfake": {
            "total": sum(1 for a in alerts if a.type == "deepfake"),
            "active": sum(1 for a in alerts if a.type == "deepfake" and a.status == "active")
        },
        "phishing": {
            "total": sum(1 for a in alerts if a.type == "phishing"),
            "active": sum(1 for a in alerts if a.type == "phishing" and a.status == "active")
        },
        "aml": {
            "total": sum(1 for a in alerts if a.type == "aml"),
            "active": sum(1 for a in alerts if a.type == "aml" and a.status == "active")
        }
    }


@router.get("/summary/timeline")
async def get_alert_timeline():
    """Get alert timeline for visualization"""
    # Mock timeline data
    return {
        "timeline": [
            {"hour": "00:00", "count": 2},
            {"hour": "04:00", "count": 1},
            {"hour": "08:00", "count": 5},
            {"hour": "12:00", "count": 8},
            {"hour": "16:00", "count": 6},
            {"hour": "20:00", "count": 4},
        ],
        "peak_hour": "12:00",
        "trend": "stable"
    }

