"""Settings API."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.setting import SettingsResponse, SettingsUpdate
from app.services.settings_repo import get_setting, set_setting, get_setting_json, set_setting_json
from app.services.telegram import send_telegram_message
from app.core.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
):
    return SettingsResponse(
        telegram_bot_token=get_setting("telegram_bot_token"),
        telegram_chat_id=get_setting("telegram_chat_id"),
        notify_time=get_setting("notify_time") or "09:00",
        default_notify_days=get_setting_json("default_notify_days") or [7, 3, 1],
        default_currency=get_setting("default_currency") or "CNY",
        exchange_rate=float(get_setting("exchange_rate") or "7.2"),
    )


@router.put("", response_model=SettingsResponse)
def update_settings(
    data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
):
    if data.telegram_bot_token is not None:
        set_setting("telegram_bot_token", data.telegram_bot_token)
    if data.telegram_chat_id is not None:
        set_setting("telegram_chat_id", data.telegram_chat_id)
    if data.notify_time is not None:
        set_setting("notify_time", data.notify_time)
    if data.default_notify_days is not None:
        set_setting_json("default_notify_days", data.default_notify_days)
    if data.default_currency is not None:
        set_setting("default_currency", data.default_currency)
    if data.exchange_rate is not None:
        set_setting("exchange_rate", str(data.exchange_rate))
    return SettingsResponse(
        telegram_bot_token=get_setting("telegram_bot_token"),
        telegram_chat_id=get_setting("telegram_chat_id"),
        notify_time=get_setting("notify_time") or "09:00",
        default_notify_days=get_setting_json("default_notify_days") or [7, 3, 1],
        default_currency=get_setting("default_currency") or "CNY",
        exchange_rate=float(get_setting("exchange_rate") or "7.2"),
    )


@router.post("/test-telegram")
def test_telegram(
    current_user: User = Depends(get_current_user),
):
    ok, err = send_telegram_message("SubTracker 测试消息：连接成功。")
    if ok:
        return {"success": True, "message": "Message sent"}
    raise HTTPException(status_code=400, detail=err)
