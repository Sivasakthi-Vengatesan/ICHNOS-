import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.invariant import Invariant
from app.schemas.invariant import (
    InvariantResponse, InvariantCreate, InvariantValidationRequest, InvariantValidationResponse
)
from app.services.invariant_compiler import InvariantCompiler

router = APIRouter()

@router.get("", response_model=List[InvariantResponse])
def list_invariants(pipeline_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Invariant)
    if pipeline_id:
        query = query.filter(Invariant.pipeline_id == pipeline_id)
    return query.all()

@router.post("", response_model=InvariantResponse)
def create_invariant(payload: InvariantCreate, db: Session = Depends(get_db)):
    # Validate DSL expression first
    val = InvariantCompiler.validate(payload.expression)
    if not val["is_valid"]:
        raise HTTPException(status_code=400, detail=f"Invalid Invariant DSL expression: {val['error_message']}")

    inv = Invariant(
        id=str(uuid.uuid4())[:8],
        pipeline_id=payload.pipeline_id,
        name=payload.name,
        description=payload.description,
        expression=payload.expression,
        severity=payload.severity,
        is_enabled=payload.is_enabled
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

@router.post("/validate", response_model=InvariantValidationResponse)
def validate_invariant_expression(payload: InvariantValidationRequest):
    res = InvariantCompiler.validate(payload.expression)
    return InvariantValidationResponse(
        is_valid=res["is_valid"],
        ast=res["ast"],
        error_message=res["error_message"],
        tokens=res["tokens"]
    )
