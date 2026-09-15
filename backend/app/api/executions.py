import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.execution import Execution, ExecutionTrace
from app.models.pipeline import Pipeline, PipelineVersion
from app.services.execution_service import ExecutionService

router = APIRouter()

@router.get("")
def list_executions(pipeline_id: str = None, db: Session = Depends(get_db)):
    executions = db.query(Execution).all()
    res = []
    for e in executions:
        res.append({
            "id": e.id,
            "pipeline_version_id": e.pipeline_version_id,
            "status": e.status,
            "started_at": e.started_at,
            "completed_at": e.completed_at,
            "input_rows": e.input_rows,
            "output_rows": e.output_rows,
            "execution_duration_ms": e.execution_duration_ms,
            "execution_metadata": e.execution_metadata
        })
    return res

@router.get("/{execution_id}")
def get_execution_detail(execution_id: str, db: Session = Depends(get_db)):
    e = db.query(Execution).filter(Execution.id == execution_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Execution not found")

    traces = [
        {
            "step_number": t.step_number,
            "step_name": t.step_name,
            "operation": t.operation,
            "input_rows": t.input_rows,
            "output_rows": t.output_rows,
            "duration_ms": t.duration_ms,
            "schema_snapshot": t.schema_snapshot
        }
        for t in e.traces
    ]

    return {
        "id": e.id,
        "pipeline_version_id": e.pipeline_version_id,
        "status": e.status,
        "started_at": e.started_at,
        "completed_at": e.completed_at,
        "input_rows": e.input_rows,
        "output_rows": e.output_rows,
        "execution_duration_ms": e.execution_duration_ms,
        "traces": traces,
        "verification_runs": [
            {
                "id": vr.id,
                "result": vr.result,
                "solver_result": vr.solver_result,
                "solver_time_ms": vr.solver_time_ms,
                "counterexample": vr.counterexample,
                "explanation": vr.explanation,
                "impact_amount": vr.impact_amount,
                "root_transformation": vr.root_transformation
            }
            for vr in e.verification_runs
        ]
    }

@router.post("/execute/{pipeline_id}")
def trigger_pipeline_execution(
    pipeline_id: str,
    version: str = "v1",
    db: Session = Depends(get_db)
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    ir = []
    inv_expr = "ASSERT output.total_amount == input.total_amount - refunded.total_amount"

    if pipeline:
        v = next((v for v in pipeline.versions if v.version == version), pipeline.versions[0] if pipeline.versions else None)
        if v:
            ir = v.transformation_ir
        if pipeline.invariants:
            inv_expr = pipeline.invariants[0].expression

    if not ir:
        if version == "v3":
            ir = [
                {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "expression": "status == 'PAID' and id != 2", "node_name": "clean_orders"},
                {"op": "AGGREGATE_SUM", "column": "amount", "node_name": "revenue_daily"}
            ]
        else:
            ir = [
                {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "expression": "status == 'PAID'", "node_name": "clean_orders"},
                {"op": "AGGREGATE_SUM", "column": "amount", "node_name": "revenue_daily"}
            ]

    result = ExecutionService.execute_pipeline(
        pipeline_id=pipeline_id,
        version=version,
        transformation_ir=ir,
        invariant_expression=inv_expr
    )

    # Persist execution record in DB
    exec_id = f"exec_{str(uuid.uuid4())[:6]}"
    new_exec = Execution(
        id=exec_id,
        pipeline_version_id=f"{pipeline_id}_{version}",
        status=result["status"],
        input_rows=result["input_rows"],
        output_rows=result["output_rows"],
        execution_duration_ms=result["execution_duration_ms"],
        execution_metadata={"version": version, "verification_result": result["verification"]["result"]}
    )
    db.add(new_exec)
    db.commit()

    for trace_item in result["traces"]:
        t = ExecutionTrace(
            id=str(uuid.uuid4())[:8],
            execution_id=exec_id,
            step_number=trace_item["step_number"],
            step_name=trace_item["step_name"],
            operation=trace_item["operation"],
            input_rows=trace_item["input_rows"],
            output_rows=trace_item["output_rows"],
            duration_ms=trace_item["duration_ms"],
            schema_snapshot=trace_item["schema_snapshot"]
        )
        db.add(t)
    db.commit()

    result["execution_id"] = exec_id
    return result
