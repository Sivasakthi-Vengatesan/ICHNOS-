import pytest
from app.services.invariant_compiler import InvariantCompiler, InvariantSyntaxError

def test_parse_simple_equality():
    expr = "ASSERT output.total_amount == input.total_amount"
    ast = InvariantCompiler.parse(expr)
    assert ast["type"] == "Assertion"
    assert ast["operator"] == "=="
    assert ast["left"]["type"] == "Metric"
    assert ast["left"]["full_name"] == "output.total_amount"
    assert ast["right"]["type"] == "Metric"
    assert ast["right"]["full_name"] == "input.total_amount"

def test_parse_arithmetic_invariant():
    expr = "ASSERT output.total_amount == input.total_amount - refunded.total_amount"
    ast = InvariantCompiler.parse(expr)
    assert ast["type"] == "Assertion"
    assert ast["operator"] == "=="
    assert ast["right"]["type"] == "BinaryOp"
    assert ast["right"]["operator"] == "-"
    assert ast["right"]["left"]["full_name"] == "input.total_amount"
    assert ast["right"]["right"]["full_name"] == "refunded.total_amount"

def test_parse_inequality():
    expr = "ASSERT output.row_count <= input.row_count"
    ast = InvariantCompiler.parse(expr)
    assert ast["operator"] == "<="

def test_parse_null_count_function():
    expr = "ASSERT output.null_count(region) == 0"
    ast = InvariantCompiler.parse(expr)
    assert ast["left"]["type"] == "FunctionCall"
    assert ast["left"]["name"] == "output.null_count"
    assert ast["left"]["args"] == ["region"]
    assert ast["right"]["value"] == 0

def test_validate_invalid_syntax():
    res = InvariantCompiler.validate("ASSERT output.total = = input.total")
    assert not res["is_valid"]
    assert res["error_message"] is not None
