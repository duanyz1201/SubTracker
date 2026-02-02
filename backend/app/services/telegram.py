"""Send message via Telegram Bot."""
import httpx
from app.services.settings_repo import get_setting


def send_telegram_message(message: str, bot_token: str | None = None, chat_id: str | None = None) -> tuple[bool, str]:
    token = bot_token or get_setting("telegram_bot_token")
    cid = chat_id or get_setting("telegram_chat_id")
    if not token or not cid:
        return False, "Telegram bot token or chat ID not configured"
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.post(url, json={"chat_id": cid, "text": message})
            if r.status_code != 200:
                return False, r.text or f"HTTP {r.status_code}"
            return True, ""
    except Exception as e:
        return False, str(e)
