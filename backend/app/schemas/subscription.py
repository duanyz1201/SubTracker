"""Subscription (service) schemas."""
from datetime import date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel


class SubscriptionBase(BaseModel):
    name: str
    category_id: UUID | None = None
    provider: str | None = None
    cost: Decimal | float = 0
    currency: str = "CNY"
    billing_cycle: str = "monthly"
    start_date: date | None = None
    expire_date: date
    notes: str | None = None
    url: str | None = None
    notify_days: list[int] | None = None


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: str | None = None
    category_id: UUID | None = None
    provider: str | None = None
    cost: Decimal | float | None = None
    currency: str | None = None
    billing_cycle: str | None = None
    start_date: date | None = None
    expire_date: date | None = None
    notes: str | None = None
    url: str | None = None
    notify_days: list[int] | None = None


class SubscriptionResponse(BaseModel):
    id: UUID
    name: str
    category_id: UUID | None
    provider: str | None
    cost: Decimal
    currency: str
    billing_cycle: str
    start_date: date | None
    expire_date: date
    status: str
    notes: str | None
    url: str | None
    notify_days: list[int] | None

    class Config:
        from_attributes = True
