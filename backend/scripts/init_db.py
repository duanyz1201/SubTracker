"""Create tables and optional default admin user."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models import User, Category, Subscription, Notification, Setting
from app.core.security import get_password_hash


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Tables created.")


def create_admin():
    from app.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == "admin").first():
            print("Admin user already exists.")
            return
        user = User(
            username="admin",
            password_hash=get_password_hash("admin"),
        )
        db.add(user)
        db.commit()
        print("Admin user created (username: admin, password: admin). Change password after first login.")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    create_admin()
