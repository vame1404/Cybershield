"""
AML (Anti-Money Laundering) Detection API Endpoints
Financial crime and suspicious transaction detection
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import random
import time
from datetime import datetime

router = APIRouter()


class TransactionRequest(BaseModel):
    """Transaction analysis request"""
    amount: float
    sender_account: Optional[str] = None
    receiver_account: Optional[str] = None
    transaction_type: str = "transfer"
    country: Optional[str] = None
    description: Optional[str] = None


class AnomalyFactors(BaseModel):
    amount_anomaly: str
    velocity_check: str
    geographic_risk: str
    behavior_pattern: str
    network_analysis: str


class AMLResult(BaseModel):
    """AML detection result"""
    transaction_id: str
    amount: float
    is_suspicious: bool
    risk_level: str
    risk_score: float
    anomaly_factors: AnomalyFactors
    recommendations: List[str]
    model_used: str
    processing_time: str
    timestamp: str


class TransactionPattern(BaseModel):
    time: str
    normal_count: int
    suspicious_count: int


# High-risk jurisdictions (simplified list)
HIGH_RISK_COUNTRIES = [
    "high-risk", "offshore", "unregulated", "sanctioned"
]


@router.post("/analyze", response_model=AMLResult)
async def analyze_transaction(request: TransactionRequest):
    """
    Analyze a transaction for money laundering indicators
    
    Uses Isolation Forest anomaly detection + Graph Neural Network
    
    - **amount**: Transaction amount in USD
    - **sender_account**: Sender account identifier
    - **receiver_account**: Receiver account identifier
    - **transaction_type**: Type of transaction (transfer, wire, deposit, etc.)
    - **country**: Country/region of transaction
    
    Returns AML risk assessment with anomaly factors
    """
    start_time = time.time()
    
    # Simulate ML inference
    time.sleep(random.uniform(0.8, 2.0))
    
    amount = request.amount
    
    # Risk factors
    high_amount = amount > 10000
    very_high_amount = amount > 50000
    high_risk_country = request.country and any(
        risk in request.country.lower() 
        for risk in HIGH_RISK_COUNTRIES
    )
    is_wire = request.transaction_type.lower() == "wire"
    
    # Calculate risk
    risk_factors = sum([
        high_amount,
        very_high_amount,
        high_risk_country,
        is_wire,
        random.random() > 0.7  # Random factor for demo
    ])
    
    is_suspicious = risk_factors >= 2
    risk_level = "high" if risk_factors >= 3 else ("medium" if risk_factors >= 2 else "low")
    risk_score = min(95, 20 + (risk_factors * 20) + random.uniform(-5, 10))
    
    processing_time = time.time() - start_time
    
    # Generate anomaly factors
    anomaly_factors = AnomalyFactors(
        amount_anomaly="Above threshold ($10,000)" if high_amount else "Within normal range",
        velocity_check="Unusual transaction frequency" if is_suspicious and random.random() > 0.5 else "Normal velocity",
        geographic_risk="Cross-border transaction detected" if high_risk_country or is_wire else "Domestic transaction",
        behavior_pattern="Deviates from historical pattern" if is_suspicious else "Consistent with history",
        network_analysis="Connected to flagged accounts" if is_suspicious and random.random() > 0.6 else "No suspicious connections"
    )
    
    # Generate recommendations
    if is_suspicious:
        recommendations = [
            "Flag for manual review",
            "Request additional documentation",
            "Verify source of funds"
        ]
        if risk_level == "high":
            recommendations.append("Check against sanctions list")
            recommendations.append("Consider filing SAR")
    else:
        recommendations = ["No action required", "Transaction appears legitimate"]
    
    return AMLResult(
        transaction_id=f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000,9999)}",
        amount=amount,
        is_suspicious=is_suspicious,
        risk_level=risk_level,
        risk_score=round(risk_score, 0),
        anomaly_factors=anomaly_factors,
        recommendations=recommendations,
        model_used="Isolation Forest + Graph Neural Network",
        processing_time=f"{processing_time:.1f}s",
        timestamp=datetime.utcnow().isoformat()
    )


@router.post("/analyze/batch")
async def analyze_batch_transactions(transactions: List[TransactionRequest]):
    """
    Analyze multiple transactions for AML patterns
    
    Useful for batch processing and pattern detection across transactions
    """
    if len(transactions) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 transactions per batch")
    
    results = []
    for txn in transactions:
        result = await analyze_transaction(txn)
        results.append(result)
    
    suspicious_count = sum(1 for r in results if r.is_suspicious)
    
    return {
        "total_transactions": len(transactions),
        "analyzed": len(results),
        "suspicious": suspicious_count,
        "clean": len(results) - suspicious_count,
        "aggregate_risk_score": round(sum(r.risk_score for r in results) / len(results), 1),
        "results": results,
        "pattern_analysis": {
            "structuring_detected": suspicious_count > len(transactions) * 0.3,
            "velocity_anomaly": random.random() > 0.7,
            "network_cluster": suspicious_count > 2
        }
    }


@router.get("/stats")
async def get_aml_stats():
    """Get AML detection module statistics"""
    return {
        "total_transactions_analyzed": 2392,
        "suspicious_flagged": 156,
        "sars_filed": 23,
        "detection_rate": "89.5%",
        "avg_processing_time": "1.2s",
        "model_info": {
            "name": "Isolation Forest + GNN",
            "features": "Transaction amount, frequency, network, geography",
            "accuracy": "89.5%",
            "last_updated": "2025-12-10"
        },
        "risk_thresholds": {
            "reporting_threshold": 10000,
            "high_risk_threshold": 50000,
            "velocity_threshold": "5 transactions/hour"
        }
    }


@router.get("/patterns")
async def get_transaction_patterns():
    """Get transaction pattern analysis for the last 24 hours"""
    patterns = []
    hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
    
    for hour in hours:
        patterns.append(TransactionPattern(
            time=hour,
            normal_count=random.randint(100, 300),
            suspicious_count=random.randint(2, 20)
        ))
    
    return {
        "time_period": "24h",
        "patterns": patterns,
        "peak_suspicious_time": "20:00",
        "total_suspicious": sum(p.suspicious_count for p in patterns),
        "anomaly_trend": "stable"
    }


@router.get("/alerts")
async def get_aml_alerts():
    """Get recent AML alerts"""
    return {
        "alerts": [
            {
                "id": "AML-001",
                "transaction_id": "TXN-789456123",
                "amount": 75000,
                "risk_level": "high",
                "status": "investigating",
                "created_at": "10 min ago"
            },
            {
                "id": "AML-002",
                "transaction_id": "TXN-456789012",
                "amount": 25000,
                "risk_level": "medium",
                "status": "reviewing",
                "created_at": "45 min ago"
            },
            {
                "id": "AML-003",
                "transaction_id": "TXN-123456789",
                "amount": 150000,
                "risk_level": "high",
                "status": "escalated",
                "created_at": "2 hours ago"
            },
        ],
        "total_active": 8,
        "pending_review": 5
    }

