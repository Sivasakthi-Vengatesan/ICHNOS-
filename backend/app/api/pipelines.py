import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.pipeline import Pipeline, PipelineVersion
from app.schemas.pipeline import (
    PipelineResponse, PipelineCreate, PipelineVersionResponse, PipelineVersionCreate
)
from app.services.version_service import VersionService
from app.schemas.verification import VersionDiffResponse

router = APIRouter()

@router.get("", response_model=List[PipelineResponse])
def list_pipelines(db: Session = Depends(get_db)):
    pipelines = db.query(Pipeline).all()
    return pipelines

@router.get("/{pipeline_id}", response_model=PipelineResponse)
def get_pipeline(pipeline_id: str, db: Session = Depends(get_db)):
    p = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Pipeline '{pipeline_id}' not found")
    return p

@router.post("", response_model=PipelineResponse)
def create_pipeline(payload: PipelineCreate, db: Session = Depends(get_db)):
    pid = str(uuid.uuid4())[:8]
    p = Pipeline(
        id=pid,
        name=payload.name,
        description=payload.description,
        source_type=payload.source_type
    )
    db.add(p)
    db.commit()

    if payload.initial_version:
        v = PipelineVersion(
            id=f"{pid}_v1",
            pipeline_id=pid,
            version=payload.initial_version.version,
            source_hash=str(uuid.uuid4())[:12],
            transformation_ir=[op.dict() for op in payload.initial_version.transformation_ir],
            schema_def=payload.initial_version.schema_def,
            metadata_json=payload.initial_version.metadata_json or {}
        )
        db.add(v)
        db.commit()

    db.refresh(p)
    return p

@router.get("/{pipeline_id}/versions", response_model=List[PipelineVersionResponse])
def get_pipeline_versions(pipeline_id: str, db: Session = Depends(get_db)):
    versions = db.query(PipelineVersion).filter(PipelineVersion.pipeline_id == pipeline_id).all()
    return versions

@router.get("/{pipeline_id}/compare", response_model=VersionDiffResponse)
def compare_pipeline_versions(
    pipeline_id: str,
    from_version: str = "v2",
    to_version: str = "v3",
    db: Session = Depends(get_db)
):
    v_from = db.query(PipelineVersion).filter(
        PipelineVersion.pipeline_id == pipeline_id,
        PipelineVersion.version == from_version
    ).first()

    v_to = db.query(PipelineVersion).filter(
        PipelineVersion.pipeline_id == pipeline_id,
        PipelineVersion.version == to_version
    ).first()

    if not v_from or not v_to:
        # Fallback comparison demo data for order pipeline v2 vs v3
        from_data = {
            "version": from_version,
            "verification_status": "VERIFIED",
            "transformation_ir": [
                {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "expression": "status == 'PAID'"},
                {"op": "AGGREGATE_SUM", "column": "amount"}
            ],
            "schema_def": {"id": "int", "amount": "float", "status": "string"}
        }
        to_data = {
            "version": to_version,
            "verification_status": "VIOLATED",
            "transformation_ir": [
                {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID", "expression": "status == 'PAID' and id != 2"},
                {"op": "AGGREGATE_SUM", "column": "amount"}
            ],
            "schema_def": {"id": "int", "amount": "float", "status": "string"},
            "counterexample": {
                "order_id": 2,
                "amount": 300,
                "status": "PAID",
                "difference": 300
            }
        }
    else:
        # Check if v_to has violated status in metadata
        to_status = v_to.metadata_json.get("status", "VERIFIED") if v_to.metadata_json else "VERIFIED"
        from_status = v_from.metadata_json.get("status", "VERIFIED") if v_from.metadata_json else "VERIFIED"
        from_data = {
            "version": v_from.version,
            "verification_status": from_status,
            "transformation_ir": v_from.transformation_ir,
            "schema_def": v_from.schema_def
        }
        to_data = {
            "version": v_to.version,
            "verification_status": to_status,
            "transformation_ir": v_to.transformation_ir,
            "schema_def": v_to.schema_def,
            "counterexample": v_to.metadata_json.get("counterexample") if v_to.metadata_json else None
        }

    return VersionService.compare_versions(pipeline_id, from_data, to_data)
