import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_telemetry():
    res = client.get("/api/v1/telemetry")
    assert res.status_code == 200
    data = res.json()
    assert "pipelines" in data
    assert "verified" in data
    assert "violated" in data

def test_list_pipelines():
    res = client.get("/api/v1/pipelines")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert any(p["id"] == "orders_pipeline" for p in data)

def test_verification_endpoint_verified():
    payload = {
        "custom_pipeline_ir": [
            {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "expression": "status == 'PAID'"},
            {"op": "AGGREGATE_SUM", "column": "amount"}
        ],
        "custom_invariant_expression": "ASSERT output.total_amount == input.total_amount - refunded.total_amount"
    }
    res = client.post("/api/v1/verification/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["result"] == "VERIFIED"
    assert data["solver_result"] == "UNSAT"

def test_verification_endpoint_violated():
    payload = {
        "custom_pipeline_ir": [
            {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "expression": "status == 'PAID' and id != 2", "node_name": "clean_orders"},
            {"op": "AGGREGATE_SUM", "column": "amount"}
        ],
        "custom_invariant_expression": "ASSERT output.total_amount == input.total_amount - refunded.total_amount"
    }
    res = client.post("/api/v1/verification/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["result"] == "VIOLATED"
    assert data["solver_result"] == "SAT"
    assert data["counterexample"]["order_id"] == 2

def test_lineage_endpoint():
    res = client.get("/api/v1/lineage/orders_pipeline?version=v3")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) >= 5

def test_compare_endpoint():
    res = client.get("/api/v1/pipelines/orders_pipeline/compare?from_version=v2&to_version=v3")
    assert res.status_code == 200
    data = res.json()
    assert data["regression_detected"] is True
    assert data["to_status"] == "VIOLATED"
