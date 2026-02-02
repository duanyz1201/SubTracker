"""Stats API."""
from datetime import date, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.stats import OverviewStats, ExpenseTrendPoint, CalendarDay
from app.services.subscription_status import compute_status
from app.core.deps import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview", response_model=OverviewStats)
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    end_of_month = (today.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
    subs = db.query(Subscription).all()
    total = len(subs)
    expiring_this_month = sum(
        1 for s in subs
        if today <= s.expire_date <= end_of_month
    )
    monthly_cny = Decimal("0")
    monthly_usd = Decimal("0")
    for s in subs:
        if compute_status(s.expire_date) == "expired":
            continue
        mult = 1
        if s.billing_cycle == "yearly":
            mult = 1 / 12
        elif s.billing_cycle == "quarterly":
            mult = 1 / 3
        if s.currency == "CNY":
            monthly_cny += s.cost * mult
        else:
            monthly_usd += s.cost * mult
    active = sum(1 for s in subs if compute_status(s.expire_date) == "active")
    return OverviewStats(
        total_services=total,
        expiring_this_month=expiring_this_month,
        monthly_expense_cny=round(monthly_cny, 2),
        monthly_expense_usd=round(monthly_usd, 2),
        active_services=active,
    )


@router.get("/expiring", response_model=list)
def get_expiring(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    target = today + timedelta(days=days)
    subs = db.query(Subscription).filter(
        Subscription.expire_date >= today,
        Subscription.expire_date <= target,
    ).order_by(Subscription.expire_date).all()
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "category_id": str(s.category_id) if s.category_id else None,
            "expire_date": s.expire_date.isoformat(),
            "status": compute_status(s.expire_date),
            "cost": float(s.cost),
            "currency": s.currency,
        }
        for s in subs
    ]


@router.get("/calendar", response_model=list[CalendarDay])
def get_calendar(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from calendar import monthrange
    _, last = monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, last)
    subs = db.query(Subscription).filter(
        Subscription.expire_date >= start,
        Subscription.expire_date <= end,
    ).all()
    by_date: dict[str, list] = {}
    today = date.today()
    for s in subs:
        d = s.expire_date.isoformat()
        if d not in by_date:
            by_date[d] = []
        delta = (s.expire_date - today).days
        by_date[d].append({
            "id": str(s.id),
            "name": s.name,
            "color": "#4382FF",
            "days_left": delta,
        })
    result = []
    for d in range(1, last + 1):
        dt = date(year, month, d)
        key = dt.isoformat()
        items = by_date.get(key, [])
        result.append(CalendarDay(
            date=key,
            service_ids=[x["id"] for x in items],
            service_names=[x["name"] for x in items],
            category_colors=[x["color"] for x in items],
            days_left=[x["days_left"] for x in items],
        ))
    return result


@router.get("/costs", response_model=list[ExpenseTrendPoint])
def get_costs(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    result = []
    for i in range(months - 1, -1, -1):
        m = today.month - 1 - i
        y = today.year
        while m < 0:
            m += 12
            y -= 1
        month_start = date(y, m + 1, 1)
        if m == 11:
            month_end = date(y, 12, 31)
        else:
            month_end = date(y, m + 2, 1) - timedelta(days=1)
        subs = db.query(Subscription).filter(
            Subscription.expire_date >= month_start,
            or_(Subscription.start_date.is_(None), Subscription.start_date <= month_end),
        ).all()
        cny = Decimal("0")
        usd = Decimal("0")
        for s in subs:
            mult = 1
            if s.billing_cycle == "yearly":
                mult = 1 / 12
            elif s.billing_cycle == "quarterly":
                mult = 1 / 3
            if s.currency == "CNY":
                cny += s.cost * mult
            else:
                usd += s.cost * mult
        result.append(ExpenseTrendPoint(
            month=f"{month_start.month}月",
            cny=round(cny, 2),
            usd=round(usd, 2),
        ))
    return result
