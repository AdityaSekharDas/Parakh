"""Contract tests for PARAKH's deterministic demonstration API."""

from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    """The API exposes its lightweight health check."""
    assert client.get("/health").json() == {"ok": True}
    assert client.get("/").json()["docs"] == "/docs"


def test_login_picker_and_assignment(client: TestClient) -> None:
    """Demo identity metadata and queue assignment follow the API contract."""
    metadata = client.get("/login/meta").json()
    assert metadata["currentAnalyst"] == "R. Das" and len(metadata["analysts"]) == 5
    assert client.post("/login", json={"role": "operator", "name": "R. Das"}).json()["ok"] is True
    assigned = client.post("/alerts/T-1421/assign", json={"assignee": "P. Nair"}).json()["alert"]
    assert assigned["status"] == "assigned" and assigned["assignee"] == "P. Nair"


def test_overview_and_queue_counts(client: TestClient) -> None:
    """The dashboard aggregates stay aligned with the seeded review queue."""
    overview = client.get("/overview").json()
    assert overview["kpi"]["customers"] == 500
    assert overview["kpi"]["activeAlerts"] == 14
    assert len(client.get("/alerts").json()) == 16
    assert len(client.get("/alerts?status=open").json()) == 14
    assert [alert["id"] for alert in client.get("/alerts?status=legit").json()] == ["T-1187"]
    assert len(client.get("/alerts?tier=red").json()) == 12


def test_alert_detail_exposes_call_and_engine(client: TestClient) -> None:
    """The star case keeps its linked call and inspectable score breakdown."""
    detail = client.get("/alerts/T-1421").json()
    assert detail["call"]["id"] == "CALL-1421"
    assert detail["alert"]["score"] == 95
    assert detail["engine"]["forestScore"] == 78
    assert detail["engine"]["fusedScore"] == 95
    assert client.get("/alerts/T-5108").json()["call"] is None


def test_resolution_moves_analytics(client: TestClient) -> None:
    """An analyst decision changes the documented learning-loop metrics."""
    before = client.get("/analytics").json()
    response = client.post("/alerts/T-1421/resolve", json={"action": "freeze", "decidedBy": "analyst"})
    assert response.json()["alert"]["status"] == "fraud"
    after = client.get("/analytics").json()
    assert before["confirmed"] == 14 and after["confirmed"] == 15
    assert before["precision"] == 84 and after["precision"] == 85


def test_citizen_endpoints(client: TestClient) -> None:
    """The citizen demo exposes only Sarita's configured account records."""
    assert [item["id"] for item in client.get("/citizen/alerts").json()] == ["T-1421", "T-1422"]
    assert client.get("/citizen/me").json()["balance"] == 184320
    assert len(client.get("/citizen/transactions").json()) == 8


def test_replay_and_live_ingest(client: TestClient) -> None:
    """The authored replay and judge-entered payment paths both return a verdict."""
    replay = client.post("/ingest", json={"txnId": "T-1422", "userId": "C-4421", "payee": "rafiq-plumbing@icici", "payeeName": "Rafiq Plumbing", "amount": 3200, "channel": "GPay", "device": "OnePlus 12 · known", "hour": "10:12"}).json()
    assert replay["score"] == 52 and replay["tier"] == "yellow" and len(replay["reasons"]) == 4
    live = client.post("/ingest", json={"txnId": "J-0001", "userId": "C-4421", "payee": "scam-x@ybl", "payeeName": "X", "amount": 99999, "channel": "GPay", "device": "New Phone", "hour": "23:59"}).json()
    assert live["tier"] == "red" and live["alertId"] == "J-0001"


def test_stream_and_call_analysis(client: TestClient) -> None:
    """Ticker paging and coercive-call analysis remain deterministic."""
    assert len(client.get("/stream?since=0").json()["events"]) == 10
    assert client.get("/stream?since=10").json()["events"] == []
    transcript = client.get("/alerts/T-1421").json()["call"]["transcript"]
    verdict = client.post("/calls/analyze", json={"transcript": transcript}).json()
    assert verdict["isCoercive"] is True
    assert verdict["confidence"] == 0.93
    assert len(verdict["patternsFound"]) == 4


def test_e2e_star_case_walkthrough(client: TestClient) -> None:
    """End-to-end chronological walkthrough of the T-1421 star case (Section 8)."""
    # 1. Ingest T-1421 raw transaction
    ingest = client.post("/ingest", json={
        "txnId": "T-1421", "userId": "C-4421", "payee": "safeguard-account@okaxis", 
        "payeeName": "S. Chaudhary", "amount": 49500, "channel": "PhonePe", 
        "device": "OnePlus 12 · new today", "hour": "14:06"
    }).json()
    assert ingest["tier"] == "red"
    assert ingest["score"] == 95
    
    # 2. GET /stream shows event (poll)
    events = client.get("/stream?since=0").json()["events"]
    assert any("T-1421" in event["text"] or "C-4421" in event["text"] for event in events)
    
    # 3. Analyst opens review
    detail = client.get("/alerts/T-1421").json()
    assert detail["alert"]["status"] in {"pending", "assigned"}
    assert detail["engine"]["fusedScore"] == 95
    assert detail["engine"]["forestScore"] == 78
    assert detail["engine"]["rulePoints"] == 95  # Based on authored variant 95
    
    # 4. Analyst hits Freeze
    before = client.get("/analytics").json()
    freeze = client.post("/alerts/T-1421/resolve", json={"action": "freeze", "decidedBy": "analyst"}).json()
    assert freeze["alert"]["status"] == "fraud"
    
    # 5. GET /analytics reflects decision
    after = client.get("/analytics").json()
    assert after["confirmed"] == before["confirmed"] + 1

