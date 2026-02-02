"""APScheduler: daily check for expiring subscriptions and send Telegram reminders."""
from datetime import date, datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import SessionLocal
from app.models.subscription import Subscription
from app.models.notification import Notification
from app.services.settings_repo import get_setting, get_setting_json
from app.services.telegram import send_telegram_message


def _run_reminder_job():
    db = SessionLocal()
    try:
        token = get_setting("telegram_bot_token")
        chat_id = get_setting("telegram_chat_id")
        if not token or not chat_id:
            return
        notify_days_default = get_setting_json("default_notify_days") or [7, 3, 1]
        today = date.today()
        for days in notify_days_default:
            target = today + timedelta(days=days)
            subs = db.query(Subscription).filter(Subscription.expire_date == target).all()
            for s in subs:
                msg = f"【SubTracker 到期提醒】\n服务：{s.name}\n到期日：{s.expire_date}\n剩余 {days} 天，请及时续费。"
                ok, err = send_telegram_message(msg, bot_token=token, chat_id=chat_id)
                n = Notification(
                    subscription_id=s.id,
                    notify_type=f"{days}d",
                    message=msg,
                    success=ok,
                    error_message=None if ok else err,
                )
                db.add(n)
        db.commit()
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


_scheduler: BackgroundScheduler | None = None


def start_scheduler():
    global _scheduler
    _scheduler = BackgroundScheduler()
    notify_time = get_setting("notify_time") or "09:00"
    parts = notify_time.strip().split(":")
    hour = int(parts[0]) if parts else 9
    minute = int(parts[1]) if len(parts) > 1 else 0
    _scheduler.add_job(_run_reminder_job, CronTrigger(hour=hour, minute=minute))
    _scheduler.start()


def shutdown_scheduler():
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
