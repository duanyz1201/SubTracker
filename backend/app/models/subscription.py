"""Subscription (service) model."""
import uuid
from sqlalchemy import Column, String, Numeric, Date, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    provider = Column(String(100), nullable=True)
    cost = Column(Numeric(10, 2), nullable=False, default=0)
    currency = Column(String(10), nullable=False, default="CNY")
    billing_cycle = Column(String(20), nullable=False, default="monthly")
    start_date = Column(Date, nullable=True)
    expire_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="active")
    notify_days = Column(JSONB, nullable=True)
    url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("Category", backref="subscriptions")
