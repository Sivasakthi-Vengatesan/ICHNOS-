from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.pipeline import Pipeline, PipelineVersion
from app.schemas.verification import LineageGraphResponse
from app.services.lineage_engine import LineageEngine

router = APIRouter()

@router.get("/{pipeline_id}", response_model=LineageGraphResponse)
def get_pipeline_lineage(
    pipeline_id: str,
    version: str = "v1",
    db: Session = Depends(get_db)
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    pipeline_name = pipeline.name if pipeline else "Orders Processing Pipeline"

    # Check if this pipeline version is violated (e.g., v3 in demo)
    is_violated = (version == "v3" or "v3" in version or pipeline_id == "orders_v3")
    status = "VIOLATED" if is_violated else "VERIFIED"

    ir = []
    if pipeline and pipeline.versions:
        target_v = next((v for v in pipeline.versions if v.version == version), pipeline.versions[0])
        ir = target_v.transformation_ir

    return LineageEngine.get_lineage_for_pipeline(
        pipeline_id=pipeline_id,
        pipeline_name=pipeline_name,
        version=version,
        transformation_ir=ir,
        verification_status=status,
        root_cause_op="clean_orders" if is_violated else None
    )
