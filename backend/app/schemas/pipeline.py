from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class TransformationIROperation(BaseModel):
    op: str = Field(..., description="Operation: FILTER, SELECT, MAP, RENAME, AGGREGATE_SUM, AGGREGATE_COUNT, JOIN, DROP_NULLS")
    node_name: Optional[str] = None
    column: Optional[str] = None
    target_column: Optional[str] = None
    operator: Optional[str] = None  # ==, !=, >, >=, <, <=, in
    value: Optional[Any] = None
    expression: Optional[str] = None
    join_type: Optional[str] = None
    join_key: Optional[str] = None
    right_dataset: Optional[str] = None
    description: Optional[str] = None

class PipelineVersionBase(BaseModel):
    version: str
    transformation_ir: List[TransformationIROperation]
    schema_def: Dict[str, str]
    metadata_json: Optional[Dict[str, Any]] = None

class PipelineVersionCreate(PipelineVersionBase):
    pass

class PipelineVersionResponse(PipelineVersionBase):
    id: str
    pipeline_id: str
    source_hash: str
    created_at: datetime

    class Config:
        from_attributes = True

class PipelineBase(BaseModel):
    name: str
    description: Optional[str] = None
    source_type: str = "Kafka/Batch"

class PipelineCreate(PipelineBase):
    initial_version: Optional[PipelineVersionCreate] = None

class PipelineResponse(PipelineBase):
    id: str
    created_at: datetime
    updated_at: datetime
    versions: List[PipelineVersionResponse] = []

    class Config:
        from_attributes = True
