"""Compute subscription status from expire_date."""
from datetime import date


def compute_status(expire_date: date) -> str:
    today = date.today()
    delta = (expire_date - today).days
    if delta < 0:
        return "expired"
    if delta <= 3:
        return "expiring"
    if delta <= 7:
        return "expiring-soon"
    return "active"
