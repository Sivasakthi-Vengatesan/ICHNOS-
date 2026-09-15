import pytest
from app.services.verification_engine import VerificationEngine

def test_verification_engine_unsat_proof():
    ir = [
        {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "expression": "status == 'PAID'"},
        {"op": "AGGREGATE_SUM", "column": "amount"}
    ]
    expr = "ASSERT output.total_amount == input.total_amount - refunded.total_amount"
    res = VerificationEngine.verify(
        transformation_ir=ir,
        invariant_expression=expr,
        schema={"id": "int", "amount": "float", "status": "string"}
    )
    assert res["result"] == "VERIFIED"
    assert res["solver_result"] == "UNSAT"
    assert res["counterexample"] is None

def test_verification_engine_sat_violation():
    ir = [
        {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "expression": "status == 'PAID' and id != 2", "node_name": "clean_orders"},
        {"op": "AGGREGATE_SUM", "column": "amount"}
    ]
    expr = "ASSERT output.total_amount == input.total_amount - refunded.total_amount"
    res = VerificationEngine.verify(
        transformation_ir=ir,
        invariant_expression=expr,
        schema={"id": "int", "amount": "float", "status": "string"}
    )
    assert res["result"] == "VIOLATED"
    assert res["solver_result"] == "SAT"
    assert res["counterexample"] is not None
    assert res["counterexample"]["order_id"] == 2
    assert res["counterexample"]["difference"] == 300.0
    assert res["root_transformation"] == "clean_orders"

def test_verification_engine_unsupported_operation():
    ir = [
        {"op": "CUSTOM_BLACKBOX_UDF", "column": "payload"}
    ]
    expr = "ASSERT output.total_amount == input.total_amount"
    res = VerificationEngine.verify(
        transformation_ir=ir,
        invariant_expression=expr,
        schema={"payload": "string"}
    )
    assert res["result"] == "UNKNOWN"
    assert "unsupported" in res["interpretation"].lower()
