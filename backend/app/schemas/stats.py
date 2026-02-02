"""Stats response schemas."""
from decimal import Decimal
from pydantic import BaseModel


class OverviewStats(BaseModel):
    total_services: int
    expiring_this_month: int
    monthly_expense_cny: Decimal
    monthly_expense_usd: Decimal
    active_services: int


class ExpenseTrendPoint(BaseModel):
    month: str
    cny: Decimal
    usd: Decimal


class CalendarDay(BaseModel):
    date: str
    service_ids: list[str]
    service_names: list[str]
    category_colors: list[str]
    days_left: list[int]
