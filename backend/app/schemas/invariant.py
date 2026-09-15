from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class InvariantBase(BaseModel):
    name: str
    description: Optional[str] = None
    expression: str = Field(..., description="Declarative Invariant DSL expression, e.g. ASSERT output.total_amount == input.total_amount - refunded.total_amount")
    severity: str = "CRITICAL"
    is_enabled: bool = True

class InvariantCreate(InvariantBase):
    pipeline_id: str

class InvariantResponse(InvariantBase):
    id: str
    pipeline_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class InvariantValidationRequest(BaseModel):
    expression: str

class InvariantValidationResponse(BaseModel):
    is_valid: bool
    ast: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    tokens: Optional[List[str]] = None
