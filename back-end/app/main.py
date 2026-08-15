"""FastAPI routes for PARAKH's deterministic fraud-review demonstration."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import json
from pathlib import Path
from . import callanalyzer, db, engine
from .schemas import AnalyzeRequest, AssignRequest, IngestRequest, LoginRequest, ResolveRequest, tier_of


ENGINE_MODE = os.environ.get("PARAKH_ENGINE", "live").lower()
OPEN_STATUSES = {"pending", "assigned", "reviewing"}
_STUB_ALERTS: list[dict] | None = None
SEED_DIR = Path(__file__).resolve().parent.parent / "seed"


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialise the demo database before the first request."""
    db.init_db()
    db.seed_if_empty()
    yield


app = FastAPI(title="PARAKH API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _alerts(status: str | None = None, tier: str | None = None) -> list[dict]:
    """Return filtered alerts while preserving the authored queue ordering."""
    global _STUB_ALERTS
    if ENGINE_MODE == "stub":
        if _STUB_ALERTS is None:
            with open(SEED_DIR / "transactions.json", "r", encoding="utf-8") as f:
                _STUB_ALERTS = json.load(f)
                for alert in _STUB_ALERTS:
                    if "txnId" in alert and "id" not in alert:
                        alert["id"] = alert.pop("txnId")
        alerts = _STUB_ALERTS
    else:
        alerts = db.list_alerts()
    if status:
        statuses = OPEN_STATUSES if status == "open" else {status}
        alerts = [alert for alert in alerts if alert["status"] in statuses]
    if tier:
        alerts = [alert for alert in alerts if alert["tier"] == tier]
    return alerts


def _analytics() -> dict:
    """Return the seed analytics plus deterministic drift from human decisions."""
    with open(SEED_DIR / "display.json", "r", encoding="utf-8") as f:
        analytics = dict(json.load(f)["analytics"])
    resolutions = db.list_resolutions()
    actions = [resolution["action"] for resolution in resolutions]
    frauds = sum(action in {"freeze", "block", "stop"} for action in actions)
    clears = actions.count("clear")
    continues = actions.count("continue")
    analytics.update({
        "confirmed": 14 + frauds,
        "falsePositives": 5 + clears,
        "actioned": 12 + len(actions),
        "actionedOf": 15 + len(actions),
        "precision": min(100, max(0, 84 + frauds - clears)),
        "recall": min(100, max(0, 76 + frauds - continues)),
    })
    return analytics


def _engine_block(alert: dict) -> dict:
    """Expose authored scoring components as inspectable judge evidence."""
    if ENGINE_MODE == "stub":
        rule_points = sum(r.get("points", 0) for r in alert.get("reasons", []))
        return {"rulePoints": rule_points, "forestScore": None, "fusedScore": alert.get("score")}
    cached = db.get_engine_scores(alert["id"])
    return cached or {"rulePoints": sum(item["points"] for item in alert["reasons"]), "forestScore": None, "fusedScore": alert["score"]}


def _verdict_card(tier: str) -> dict | None:
    """Build the human-choice card only for payments held for review."""
    if tier == "green":
        return None
    if tier == "yellow":
        return {"title": "Payment held for your confirmation", "choices": ["This is mine — continue", "Not mine — stop it"], "learns": True}
    return {"title": "Payment held for bank review", "choices": ["Bank analyst review required"], "learns": True}


@app.get("/health")
def health() -> dict:
    """Confirm that the local demo API is reachable."""
    return {"ok": True}


@app.get("/")
def root() -> dict:
    """Point a browser opened at the API root to the useful demo endpoints."""
    return {"name": "PARAKH API", "docs": "/docs", "health": "/health"}


@app.post("/login")
def login(identity: LoginRequest) -> dict:
    """Echo a demo identity; real banking credentials are never accepted."""
    return {"ok": True, "identity": identity.model_dump()}


@app.get("/login/meta")
def login_meta() -> dict:
    """Provide the fixed operator and citizen pickers for the login screen."""
    with open(SEED_DIR / "display.json", "r", encoding="utf-8") as f:
        display = json.load(f)
    with open(SEED_DIR / "users.json", "r", encoding="utf-8") as f:
        users = json.load(f)
    return {"analysts": display["analysts"], "currentAnalyst": display["currentAnalyst"], "customers": [{"id": customer["id"], "name": customer["name"]} for customer in users]}


@app.get("/overview")
def overview() -> dict:
    """Return the operator dashboard metrics, score distribution, and recent alerts."""
    with open(SEED_DIR / "cohort.json", "r", encoding="utf-8") as f:
        cohort = json.load(f)
    open_alerts = _alerts(status="open")
    histogram = []
    for lower in range(0, 100, 10):
        histogram.append({"bucket": f"{lower}–{lower + 9}", "count": sum(lower <= customer["score"] <= lower + 9 for customer in cohort), "tier": tier_of(lower)})
    resolutions = db.list_resolutions()
    actions = [resolution["action"] for resolution in resolutions]
    frauds = sum(action in {"freeze", "block", "stop"} for action in actions)
    clears = actions.count("clear")
    continues = actions.count("continue")
    with open(SEED_DIR / "display.json", "r", encoding="utf-8") as f:
        display = json.load(f)
    return {"kpi": {"customers": len(cohort), "activeAlerts": len(open_alerts), "alertsToday": 3, "avgScore": round(sum(customer["score"] for customer in cohort) / len(cohort)), "interceptedLakh": 11.8, "interceptedPct": 2.4, "precision": min(100, max(0, 82 + frauds - clears)), "recall": min(100, max(0, 74 + frauds - continues))}, "histogram": histogram, "recent": _alerts()[:6], "model": display["analytics"]["model"]}


@app.get("/alerts")
def list_alerts(status: str | None = None, tier: str | None = None) -> list[dict]:
    """List the review queue, optionally filtered by status and risk tier."""
    return _alerts(status, tier)


@app.get("/alerts/{alert_id}")
def alert_detail(alert_id: str) -> dict:
    """Return one alert with its linked call, customer, decisions, and score evidence."""
    alert = next((item for item in _alerts() if item["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="alert not found")
    return {"alert": alert, "call": db.get_call(alert["callId"]) if alert.get("callId") else None, "customer": db.get_user(alert["customerId"]), "resolutions": db.list_resolutions(alert_id), "engine": _engine_block(alert)}


@app.post("/alerts/{alert_id}/assign")
def assign_alert(alert_id: str, request: AssignRequest) -> dict:
    """Assign an alert and move a pending case into the assigned state."""
    alert = next((item for item in _alerts() if item["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="alert not found")
    alert["assignee"] = request.assignee
    if alert["status"] == "pending":
        alert["status"] = "assigned"
    if ENGINE_MODE != "stub":
        db.save_alert(alert)
    return {"ok": True, "alert": alert}


@app.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str, request: ResolveRequest) -> dict:
    """Record a citizen or analyst decision while retaining the original evidence."""
    alert = next((item for item in _alerts() if item["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="alert not found")
    fraud = request.action in {"freeze", "block", "stop"}
    with open(SEED_DIR / "display.json", "r", encoding="utf-8") as f:
        current_analyst = json.load(f)["currentAnalyst"]
    alert["status"] = "fraud" if fraud else "legit"
    alert["resolution"] = f"Confirmed by {current_analyst}" if fraud else f"Marked legitimate by {request.decidedBy}"
    if request.decidedBy == "analyst":
        alert["assignee"] = current_analyst
    if ENGINE_MODE != "stub":
        db.save_alert(alert)
    db.add_resolution(alert_id, request.action, request.decidedBy, request.note)
    return {"ok": True, "alert": alert}


@app.get("/analytics")
def analytics() -> dict:
    """Return learning-loop metrics that move after each recorded resolution."""
    return _analytics()


@app.post("/ingest")
def ingest(transaction: IngestRequest) -> dict:
    """Score a seeded replay payment or an unknown judge-entered payment."""
    with open(SEED_DIR / "citizen.json", "r", encoding="utf-8") as f:
        citizen_txns = json.load(f)["transactions"]
    replay = next((item for item in citizen_txns if item["id"] == transaction.txnId), None)
    authored = next((item for item in _alerts() if item["id"] == transaction.txnId), None)
    if replay and authored:
        return {"alertId": authored["id"], "txnId": transaction.txnId, "score": authored["score"], "tier": authored["tier"], "reasons": authored["reasons"], "verdictCard": _verdict_card(authored["tier"])}
    user = db.get_user(transaction.userId)
    if not user:
        raise HTTPException(status_code=400, detail="unknown userId; choose a seeded customer")
    calls = db.list_calls_by_user(transaction.userId)
    call = next((item for item in calls if item.get("isCoercive")), None)
    db.insert_transaction(transaction.model_dump())
    verdict = engine.score_transaction(transaction.model_dump(), user, call, velocity=0, forest=None)
    if verdict["tier"] == "green":
        return {"alertId": None, "txnId": transaction.txnId, "score": verdict["score"], "tier": "green", "reasons": [], "verdictCard": None}
    alert = {"id": transaction.txnId, "customerId": transaction.userId, "customerName": user["name"], "payee": transaction.payee, "payeeName": transaction.payeeName, "amount": transaction.amount, "channel": transaction.channel, "device": transaction.device, "hour": transaction.hour, "score": verdict["score"], "tier": verdict["tier"], "reason": "; ".join(item["label"] for item in verdict["reasons"]), "reasons": verdict["reasons"], "narrative": "Live deterministic score for a judge-entered payment.", "callId": call["id"] if call else None, "status": "pending", "assignee": None, "resolution": None, "ageDays": 0, "generatedAt": "demo-live", "confidence": "Live rule score", "series": [verdict["score"]] * 20, "txnAt": 0, "callAt": 0 if call else None}
    db.insert_alert(alert)
    return {"alertId": alert["id"], "txnId": transaction.txnId, "score": alert["score"], "tier": alert["tier"], "reasons": alert["reasons"], "verdictCard": _verdict_card(alert["tier"])}


@app.get("/stream")
def stream(since: int = 0) -> dict:
    """Return deterministic ticker events after the caller's last index."""
    safe_since = max(0, since)
    with open(SEED_DIR / "display.json", "r", encoding="utf-8") as f:
        ticker = json.load(f)["ticker"]
    return {"events": ticker[safe_since:], "next": len(ticker)}


@app.post("/calls/analyze")
def analyze_call(request: AnalyzeRequest) -> dict:
    """Analyze a supplied redacted transcript with the same demo classifier."""
    return callanalyzer.analyze(request.transcript)


@app.get("/citizen/me")
def citizen_me() -> dict:
    """Return Sarita's fixed citizen persona and demo balance."""
    with open(SEED_DIR / "citizen.json", "r", encoding="utf-8") as f:
        citizen = json.load(f)
    return {"customer": db.get_user(citizen["customer"]["id"]), "balance": citizen["balance"]}


@app.get("/citizen/alerts")
def citizen_alerts() -> list[dict]:
    """Return only the current citizen's alerts in their authored order."""
    with open(SEED_DIR / "citizen.json", "r", encoding="utf-8") as f:
        customer_id = json.load(f)["customer"]["id"]
    return [alert for alert in _alerts() if alert["customerId"] == customer_id]


@app.get("/citizen/transactions")
def citizen_transactions() -> list[dict]:
    """Return the eight fixed statement rows for the citizen demonstration."""
    with open(SEED_DIR / "citizen.json", "r", encoding="utf-8") as f:
        return json.load(f)["transactions"]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
