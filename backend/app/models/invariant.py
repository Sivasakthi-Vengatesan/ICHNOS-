from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Invariant(Base):
    __tablename__ = "invariants"

    id = Column(String(64), primary_key=True, index=True)
    pipeline_id = Column(String(64), ForeignKey("pipelines.id"), nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    expression = Column(Text, nullable=False)  # e.g., "ASSERT output.total_amount == input.total_amount - refunded.total_amount"
    severity = Column(String(32), default="CRITICAL")  # CRITICAL, WARNING, INFO
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    pipeline = relationship("Pipeline", back_populates="invariants")
    verification_runs = relationship("VerificationRun", back_populates="invariant", cascade="all, delete-orphan")

class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id = Column(String(64), primary_key=True, index=True)
    execution_id = Column(String(64), ForeignKey("executions.id"), nullable=True)
    invariant_id = Column(String(64), ForeignKey("invariants.id"), nullable=False)
    result = Column(String(32), nullable=False)  # VERIFIED, VIOLATED, UNKNOWN
    solver_name = Column(String(32), default="z3")
    solver_result = Column(String(32), default="UNSAT")  # UNSAT, SAT, UNKNOWN
    solver_time_ms = Column(Float, default=0.0)
    counterexample = Column(JSON, nullable=True)
    explanation = Column(Text, nullable=True)
    impact_amount = Column(Float, nullable=True)
    root_transformation = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    execution = relationship("Execution", back_populates="verification_runs")
    invariant = relationship("Invariant", back_populates="verification_runs")
