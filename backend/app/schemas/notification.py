"""Notification (reminder log) schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: UUID
    subscription_id: UUID
    notify_type: str
    message: str | None
    sent_at: datetime
    success: bool
    error_message: str | None

    class Config:
        from_attributes = True
