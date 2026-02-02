"""Subscriptions (services) API."""
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from app.services.subscription_status import compute_status
from app.core.deps import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


def _sub_to_response(s: Subscription) -> SubscriptionResponse:
    return SubscriptionResponse(
        id=s.id,
        name=s.name,
        category_id=s.category_id,
        provider=s.provider,
        cost=s.cost,
        currency=s.currency,
        billing_cycle=s.billing_cycle,
        start_date=s.start_date,
        expire_date=s.expire_date,
        status=compute_status(s.expire_date),
        notes=s.notes,
        url=s.url,
        notify_days=s.notify_days if s.notify_days is not None else [7, 3, 1],
    )


@router.get("", response_model=list[SubscriptionResponse])
def list_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category_id: UUID | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
):
    q = db.query(Subscription)
    if category_id is not None:
        q = q.filter(Subscription.category_id == category_id)
    subs = q.order_by(Subscription.expire_date).all()
    result = [_sub_to_response(s) for s in subs]
    if status_filter:
        result = [r for r in result if r.status == status_filter]
    return result


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
def get_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return _sub_to_response(s)


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_subscription(
    data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = Subscription(
        name=data.name,
        category_id=data.category_id,
        provider=data.provider,
        cost=data.cost,
        currency=data.currency,
        billing_cycle=data.billing_cycle,
        start_date=data.start_date,
        expire_date=data.expire_date,
        status=compute_status(data.expire_date),
        notes=data.notes,
        url=data.url,
        notify_days=data.notify_days,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _sub_to_response(s)


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
def update_subscription(
    subscription_id: UUID,
    data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    if data.expire_date is not None:
        s.status = compute_status(data.expire_date)
    elif "expire_date" not in data.model_dump(exclude_unset=True):
        s.status = compute_status(s.expire_date)
    db.commit()
    db.refresh(s)
    return _sub_to_response(s)


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    db.delete(s)
    db.commit()


@router.post("/{subscription_id}/renew", response_model=SubscriptionResponse)
def renew_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    from datetime import timedelta
    if s.billing_cycle == "monthly":
        s.expire_date = s.expire_date + timedelta(days=30)
    elif s.billing_cycle == "quarterly":
        s.expire_date = s.expire_date + timedelta(days=90)
    elif s.billing_cycle == "yearly":
        s.expire_date = date(s.expire_date.year + 1, s.expire_date.month, s.expire_date.day)
    else:
        s.expire_date = s.expire_date + timedelta(days=30)
    s.status = compute_status(s.expire_date)
    db.commit()
    db.refresh(s)
    return _sub_to_response(s)
