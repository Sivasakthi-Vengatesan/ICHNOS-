from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CounterexampleRecord(BaseModel):
    order_id: Optional[Any] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    fields: Dict[str, Any] = Field(default_factory=dict)
    expected_contribution: Optional[float] = None
    actual_contribution: Optional[float] = None
    difference: Optional[float] = None

class VerificationRequest(BaseModel):
    pipeline_id: Optional[str] = None
    version_id: Optional[str] = None
    invariant_id: Optional[str] = None
    # Ad-hoc verification payload for interactive playground
    custom_pipeline_ir: Optional[List[Dict[str, Any]]] = None
    custom_invariant_expression: Optional[str] = None
    custom_schema: Optional[Dict[str, str]] = None
    sample_data: Optional[List[Dict[str, Any]]] = None

class VerificationResponse(BaseModel):
    id: Optional[str] = None
    pipeline_id: Optional[str] = None
    version: Optional[str] = None
    invariant_name: Optional[str] = None
    invariant_expression: str
    result: str  # VERIFIED, VIOLATED, UNKNOWN
    solver_name: str = "z3"
    solver_result: str  # UNSAT, SAT, UNKNOWN
    solver_time_ms: float
    interpretation: str
    counterexample: Optional[Dict[str, Any]] = None
    explanation: Optional[str] = None
    impact_amount: Optional[float] = None
    root_transformation: Optional[str] = None
    active_constraints: Optional[List[str]] = None
    created_at: Optional[datetime] = None

class LineageNode(BaseModel):
    id: str
    label: str
    type: str  # source, transformation, dataset, sink, aggregate
    rows: Optional[int] = None
    schema_def: Optional[Dict[str, str]] = None
    operation: Optional[str] = None
    status: Optional[str] = None  # verified, violated, active, normal
    is_root_cause: bool = False

class LineageEdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    edge_type: str = "table"  # table, column
    source_column: Optional[str] = None
    target_column: Optional[str] = None
    is_violated_path: bool = False

class LineageGraphResponse(BaseModel):
    pipeline_id: str
    pipeline_name: str
    version: str
    nodes: List[LineageNode]
    edges: List[LineageEdgeSchema]
    column_lineage: Optional[List[Dict[str, Any]]] = None

class VersionDiffResponse(BaseModel):
    pipeline_id: str
    from_version: str
    to_version: str
    from_status: str
    to_status: str
    transformation_diff: List[Dict[str, Any]]
    schema_diff: Dict[str, Any]
    invariant_changes: List[Dict[str, Any]]
    regression_detected: bool
    counterexample: Optional[Dict[str, Any]] = None
