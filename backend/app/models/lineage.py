from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class LineageEdge(Base):
    __tablename__ = "lineage_edges"

    id = Column(String(64), primary_key=True, index=True)
    execution_id = Column(String(64), ForeignKey("executions.id"), nullable=True)
    source_node = Column(String(128), nullable=False)
    target_node = Column(String(128), nullable=False)
    transformation_name = Column(String(128), nullable=False)
    edge_type = Column(String(32), default="table")  # "table" or "column"
    source_column = Column(String(128), nullable=True)
    target_column = Column(String(128), nullable=True)
    edge_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    execution = relationship("Execution", back_populates="lineage_edges")
