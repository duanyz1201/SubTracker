"""Settings schemas."""
from pydantic import BaseModel


class SettingsResponse(BaseModel):
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    notify_time: str = "09:00"
    default_notify_days: list[int] = [7, 3, 1]
    default_currency: str = "CNY"
    exchange_rate: float = 7.2


class SettingsUpdate(BaseModel):
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    notify_time: str | None = None
    default_notify_days: list[int] | None = None
    default_currency: str | None = None
    exchange_rate: float | None = None
