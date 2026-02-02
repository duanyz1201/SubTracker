# SubTracker 后端

FastAPI + PostgreSQL + APScheduler + Telegram 提醒。

## 快速开始

```bash
# 创建虚拟环境并安装依赖
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env：DATABASE_URL、SECRET_KEY 等

# 创建数据库表与默认管理员（admin / admin）
python scripts/init_db.py

# 启动
uvicorn app.main:app --reload --port 8000
```

API 文档：http://localhost:8000/docs

## 项目结构

- `app/main.py` - 应用入口、CORS、路由挂载
- `app/config.py` - 配置（环境变量）
- `app/database.py` - SQLAlchemy 引擎与会话
- `app/models/` - 用户、分类、订阅、提醒、设置模型
- `app/schemas/` - Pydantic 请求/响应模型
- `app/routers/` - 认证、分类、订阅、统计、设置、提醒记录
- `app/core/` - 安全（JWT、密码）、依赖（get_current_user）
- `app/services/` - 设置读写、Telegram 发送、订阅状态计算
- `app/scheduler.py` - 每日到期提醒定时任务
