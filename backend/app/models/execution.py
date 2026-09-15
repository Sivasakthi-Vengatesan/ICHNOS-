from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Execution(Base):
    __tablename__ = "executions"

    id = Column(String(64), primary_key=True, index=True)
    pipeline_version_id = Column(String(64), ForeignKey("pipeline_versions.id"), nullable=False)
    status = Column(String(32), default="SUCCESS")  # SUCCESS, VIOLATED, FAILED, RUNNING
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)
    input_rows = Column(Integer, default=0)
    output_rows = Column(Integer, default=0)
    execution_duration_ms = Column(Float, default=0.0)
    execution_metadata = Column(JSON, default=dict)

    pipeline_version = relationship("PipelineVersion", back_populates="executions")
    traces = relationship("ExecutionTrace", back_populates="execution", cascade="all, delete-orphan")
    verification_runs = relationship("VerificationRun", back_populates="execution", cascade="all, delete-orphan")
    lineage_edges = relationship("LineageEdge", back_populates="execution", cascade="all, delete-orphan")

class ExecutionTrace(Base):
    __tablename__ = "execution_traces"

    id = Column(String(64), primary_key=True, index=True)
    execution_id = Column(String(64), ForeignKey("executions.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_name = Column(String(128), nullable=False)
    operation = Column(String(64), nullable=False)
    input_rows = Column(Integer, default=0)
    output_rows = Column(Integer, default=0)
    duration_ms = Column(Float, default=0.0)
    schema_snapshot = Column(JSON, default=dict)
    metadata_json = Column(JSON, default=dict)

    execution = relationship("Execution", back_populates="traces")
