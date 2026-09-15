from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    source_type = Column(String(64), default="Kafka/Batch")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = relationship("PipelineVersion", back_populates="pipeline", cascade="all, delete-orphan")
    invariants = relationship("Invariant", back_populates="pipeline", cascade="all, delete-orphan")

class PipelineVersion(Base):
    __tablename__ = "pipeline_versions"

    id = Column(String(64), primary_key=True, index=True)
    pipeline_id = Column(String(64), ForeignKey("pipelines.id"), nullable=False)
    version = Column(String(32), nullable=False)  # e.g., "v1", "v2", "v3"
    source_hash = Column(String(64), nullable=False)
    transformation_ir = Column(JSON, nullable=False)  # JSON list of IR operations
    schema_def = Column(JSON, nullable=False)         # Dict of column -> type
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(JSON, default=dict)

    pipeline = relationship("Pipeline", back_populates="versions")
    executions = relationship("Execution", back_populates="pipeline_version", cascade="all, delete-orphan")
