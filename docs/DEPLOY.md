# SubTracker 部署说明

## 一、环境要求

- **后端**: Python 3.11+、PostgreSQL 15+
- **前端**: Node.js 20+（构建用）
- **可选**: Nginx（反向代理）、systemd（进程管理）

## 二、后端部署

### 2.1 创建数据库

```bash
# PostgreSQL 中创建数据库和用户
sudo -u postgres psql -c "CREATE USER subtracker WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE subtracker OWNER subtracker;"
```

### 2.2 安装依赖与初始化

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env：DATABASE_URL、SECRET_KEY、CORS_ORIGINS 等
```

### 2.3 创建表与初始管理员

```bash
# 在 backend 目录下，已激活 venv
python scripts/init_db.py
# 会创建所有表，并创建默认管理员：用户名 admin，密码 admin（请首次登录后修改）
```

### 2.4 启动后端

```bash
# 开发
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产（配合 systemd）
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2.5 Systemd 示例（可选）

`/etc/systemd/system/subtracker.service`:

```ini
[Unit]
Description=SubTracker Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/subtracker/backend
Environment="PATH=/opt/subtracker/backend/venv/bin"
ExecStart=/opt/subtracker/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

## 三、前端部署

### 3.1 开发模式（对接本地后端）

```bash
cd app
cp .env.example .env
# 编辑 .env：VITE_API_BASE_URL=http://localhost:8000
npm install --legacy-peer-deps
npm run dev
# 访问 http://localhost:5173，登录 admin / admin
```

### 3.2 生产构建

```bash
cd app
# 若对接生产后端，设置 .env 中 VITE_API_BASE_URL 为后端地址，如 https://api.example.com
npm run build
# 产物在 app/dist，由 Nginx 等托管静态文件
```

## 四、Nginx 反向代理（可选）

- 前端静态：`/` → `app/dist`
- 后端 API：`/api` → `http://127.0.0.1:8000`

示例配置片段：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /opt/subtracker/app/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

前端生产环境需将 `VITE_API_BASE_URL` 设为与当前域名一致（如 `https://your-domain.com`），或使用相对路径（需 Nginx 将 `/api` 代理到后端）。

## 五、环境变量汇总

| 变量 | 位置 | 说明 |
|------|------|------|
| `DATABASE_URL` | backend/.env | PostgreSQL 连接串 |
| `SECRET_KEY` | backend/.env | JWT 签名密钥 |
| `CORS_ORIGINS` | backend/.env | 允许的跨域来源，逗号分隔 |
| `VITE_API_BASE_URL` | app/.env | 前端请求的后端根地址（如 http://localhost:8000） |

Telegram 可在「系统设置」中配置，无需写进 .env。
