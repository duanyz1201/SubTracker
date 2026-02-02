"""Read/write key-value settings from DB."""
from app.database import SessionLocal
from app.models.setting import Setting
import json


def get_setting(key: str, default: str | None = None) -> str | None:
    db = SessionLocal()
    try:
        row = db.query(Setting).filter(Setting.key == key).first()
        return row.value if row else default
    finally:
        db.close()


def set_setting(key: str, value: str | None):
    db = SessionLocal()
    try:
        row = db.query(Setting).filter(Setting.key == key).first()
        if row:
            row.value = value
        else:
            db.add(Setting(key=key, value=value))
        db.commit()
    finally:
        db.close()


def get_setting_json(key: str, default=None):
    v = get_setting(key)
    if v is None:
        return default
    try:
        return json.loads(v)
    except Exception:
        return default


def set_setting_json(key: str, value):
    set_setting(key, json.dumps(value) if value is not None else None)
