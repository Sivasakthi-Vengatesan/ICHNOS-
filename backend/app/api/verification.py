import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.pipeline import Pipeline, PipelineVersion
from app.models.invariant import Invariant, VerificationRun
from app.schemas.verification import VerificationRequest, VerificationResponse
from app.services.verification_engine import VerificationEngine

router = APIRouter()

@router.post("/run", response_model=VerificationResponse)
def run_verification(payload: VerificationRequest, db: Session = Depends(get_db)):
    # Case 1: Custom Ad-hoc verification payload (e.g. from interactive SMT playground)
    if payload.custom_invariant_expression and payload.custom_pipeline_ir:
        res = VerificationEngine.verify(
            transformation_ir=payload.custom_pipeline_ir,
            invariant_expression=payload.custom_invariant_expression,
            schema=payload.custom_schema or {"id": "int", "amount": "float", "status": "string"},
            sample_data=payload.sample_data
        )
        return VerificationResponse(
            id=str(uuid.uuid4())[:8],
            pipeline_id=payload.pipeline_id or "adhoc",
            version=payload.version_id or "custom",
            invariant_name="CUSTOM_INVARIANT",
            invariant_expression=payload.custom_invariant_expression,
            result=res["result"],
            solver_name=res["solver_name"],
            solver_result=res["solver_result"],
            solver_time_ms=res["solver_time_ms"],
            interpretation=res["interpretation"],
            counterexample=res["counterexample"],
            explanation=res["explanation"],
            impact_amount=res["impact_amount"],
            root_transformation=res["root_transformation"],
            active_constraints=res["active_constraints"]
        )

    # Case 2: Verification of saved pipeline & version
    pipeline = None
    if payload.pipeline_id:
        pipeline = db.query(Pipeline).filter(Pipeline.id == payload.pipeline_id).first()

    if not pipeline:
        # If pipeline not found in DB, run default canonical check
        ir = payload.custom_pipeline_ir or [
            {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "node_name": "clean_orders"},
            {"op": "AGGREGATE_SUM", "column": "amount", "node_name": "revenue_daily"}
        ]
        inv_expr = payload.custom_invariant_expression or "ASSERT output.total_amount == input.total_amount - refunded.total_amount"
        res = VerificationEngine.verify(
            transformation_ir=ir,
            invariant_expression=inv_expr,
            schema={"id": "int", "amount": "float", "status": "string"}
        )
        return VerificationResponse(
            id=str(uuid.uuid4())[:8],
            pipeline_id="orders_pipeline",
            version="v1",
            invariant_name="PAYMENT_COMPLETENESS",
            invariant_expression=inv_expr,
            result=res["result"],
            solver_name=res["solver_name"],
            solver_result=res["solver_result"],
            solver_time_ms=res["solver_time_ms"],
            interpretation=res["interpretation"],
            counterexample=res["counterexample"],
            explanation=res["explanation"],
            impact_amount=res["impact_amount"],
            root_transformation=res["root_transformation"],
            active_constraints=res["active_constraints"]
        )

    version = None
    if payload.version_id:
        version = db.query(PipelineVersion).filter(
            PipelineVersion.pipeline_id == payload.pipeline_id,
            PipelineVersion.version == payload.version_id
        ).first()
    if not version and pipeline.versions:
        version = pipeline.versions[-1]

    invariant = None
    if payload.invariant_id:
        invariant = db.query(Invariant).filter(Invariant.id == payload.invariant_id).first()
    if not invariant and pipeline.invariants:
        invariant = pipeline.invariants[0]

    inv_expression = invariant.expression if invariant else "ASSERT output.total_amount == input.total_amount - refunded.total_amount"
    inv_name = invariant.name if invariant else "PAYMENT_COMPLETENESS"
    ir = version.transformation_ir if version else []
    schema_def = version.schema_def if version else {"id": "int", "amount": "float", "status": "string"}

    res = VerificationEngine.verify(
        transformation_ir=ir,
        invariant_expression=inv_expression,
        schema=schema_def
    )

    # Persist verification run
    v_run = VerificationRun(
        id=str(uuid.uuid4())[:8],
        invariant_id=invariant.id if invariant else "inv_default",
        result=res["result"],
        solver_name=res["solver_name"],
        solver_result=res["solver_result"],
        solver_time_ms=res["solver_time_ms"],
        counterexample=res["counterexample"],
        explanation=res["explanation"],
        impact_amount=res["impact_amount"],
        root_transformation=res["root_transformation"]
    )
    if invariant:
        db.add(v_run)
        db.commit()

    return VerificationResponse(
        id=v_run.id,
        pipeline_id=pipeline.id,
        version=version.version if version else "v1",
        invariant_name=inv_name,
        invariant_expression=inv_expression,
        result=res["result"],
        solver_name=res["solver_name"],
        solver_result=res["solver_result"],
        solver_time_ms=res["solver_time_ms"],
        interpretation=res["interpretation"],
        counterexample=res["counterexample"],
        explanation=res["explanation"],
        impact_amount=res["impact_amount"],
        root_transformation=res["root_transformation"],
        active_constraints=res["active_constraints"]
    )

@router.get("/runs/{run_id}", response_model=VerificationResponse)
def get_verification_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(VerificationRun).filter(VerificationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Verification run not found")
    return VerificationResponse(
        id=run.id,
        invariant_name=run.invariant.name if run.invariant else "INVARIANT",
        invariant_expression=run.invariant.expression if run.invariant else "",
        result=run.result,
        solver_name=run.solver_name,
        solver_result=run.solver_result,
        solver_time_ms=run.solver_time_ms,
        interpretation="Formally verified" if run.result == "VERIFIED" else "Counterexample detected",
        counterexample=run.counterexample,
        explanation=run.explanation,
        impact_amount=run.impact_amount,
        root_transformation=run.root_transformation,
        created_at=run.created_at
    )
