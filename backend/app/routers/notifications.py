"""Notifications (reminder logs) API."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
):
    rows = db.query(Notification).order_by(Notification.sent_at.desc()).limit(limit).all()
    return [
        NotificationResponse(
            id=r.id,
            subscription_id=r.subscription_id,
            notify_type=r.notify_type,
            message=r.message,
            sent_at=r.sent_at,
            success=r.success,
            error_message=r.error_message,
        )
        for r in rows
    ]
