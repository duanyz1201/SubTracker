# SubTracker - 订阅服务管理系统 需求文档

## 一、项目概述

一个用于管理公司各类订阅服务（云服务器、域名、RPC节点等）的系统，支持到期提醒和可视化管理。

### 1.1 背景

公司有多台云服务器、订阅的 RPC 节点、域名等服务，分布在多个平台及服务商，容易忘记续费。需要一个统一的管理系统来追踪这些订阅服务，并在到期前发送提醒。

### 1.2 目标

- 统一管理所有订阅服务
- 到期前自动发送 Telegram 提醒
- 提供 Web 界面方便查看和管理

---

## 二、功能需求

### 2.1 服务管理

| 功能 | 说明 |
|------|------|
| 添加服务 | 名称、分类、服务商、费用、到期时间、备注 |
| 编辑服务 | 修改服务信息 |
| 删除服务 | 删除不再需要的服务 |
| 自定义分类 | 用户可自行添加/编辑/删除分类 |
| 续费确认 | 标记服务为"已续费"并更新到期时间 |

### 2.2 到期提醒

| 功能 | 说明 |
|------|------|
| 提醒节点 | 到期前 7天、3天、1天 |
| 提醒渠道 | Telegram Bot 推送 |
| 提醒对象 | 单用户（配置 Chat ID） |
| 定时检查 | 每天定时扫描即将到期的服务 |

### 2.3 Web 页面

| 功能 | 说明 |
|------|------|
| 仪表盘首页 | 快到期服务概览、统计数据 |
| 服务列表 | 展示所有服务，支持搜索和筛选 |
| 日历视图 | 按日历展示到期时间分布 |
| 费用统计 | 月度/年度费用报表和图表 |
| 分类管理 | 管理自定义分类 |
| 系统设置 | Telegram 配置、提醒设置 |

### 2.4 用户认证

| 功能 | 说明 |
|------|------|
| 登录 | 用户名 + 密码登录 |
| 单用户 | 系统仅支持一个管理员账户 |
| 会话管理 | JWT Token 认证 |

---

## 三、技术方案

### 3.1 技术栈

| 层级 | 技术选型 |
|------|----------|
| 后端 | Python 3.11+ + FastAPI |
| 前端 | React 18 + TailwindCSS |
| 数据库 | PostgreSQL 15+ |
| 定时任务 | APScheduler |
| 消息推送 | Telegram Bot API |

### 3.2 系统架构

```
┌─────────────────────────────────────┐
│          React 前端                  │
│    (仪表盘/列表/日历/统计)            │
└──────────────┬──────────────────────┘
               │ HTTP API
┌──────────────▼──────────────────────┐
│          FastAPI 后端                │
├─────────────────────────────────────┤
│  路由层  │  服务层  │  定时任务       │
│         │         │  (APScheduler)  │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌────────────┐   ┌───────────┐
│ PostgreSQL │   │ Telegram  │
│   数据库    │   │  Bot API  │
└────────────┘   └───────────┘
```

### 3.3 数据库设计

#### 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名 |
| password_hash | VARCHAR(255) | 密码哈希 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 分类表 (categories)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(50) | 分类名称 |
| color | VARCHAR(7) | 显示颜色(HEX) |
| icon | VARCHAR(50) | 图标名称(可选) |
| sort_order | INT | 排序序号 |
| created_at | TIMESTAMP | 创建时间 |

#### 服务表 (subscriptions)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 服务名称 |
| category_id | UUID | 分类ID(外键) |
| provider | VARCHAR(100) | 服务商 |
| cost | DECIMAL(10,2) | 费用 |
| currency | VARCHAR(10) | 货币单位(CNY/USD) |
| billing_cycle | VARCHAR(20) | 计费周期(monthly/quarterly/yearly/once) |
| expire_date | DATE | 到期日期 |
| status | VARCHAR(20) | 状态(active/expired/renewed) |
| notify_days | JSONB | 提醒天数配置，默认 [7,3,1] |
| url | VARCHAR(500) | 服务链接(可选) |
| notes | TEXT | 备注 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 提醒记录表 (notifications)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| subscription_id | UUID | 服务ID(外键) |
| notify_type | VARCHAR(20) | 提醒类型(7d/3d/1d) |
| message | TEXT | 提醒内容 |
| sent_at | TIMESTAMP | 发送时间 |
| success | BOOLEAN | 是否成功 |
| error_message | TEXT | 错误信息(失败时) |

#### 系统设置表 (settings)

| 字段 | 类型 | 说明 |
|------|------|------|
| key | VARCHAR(50) | 配置键(主键) |
| value | TEXT | 配置值 |
| updated_at | TIMESTAMP | 更新时间 |

**预置设置项：**
- `telegram_bot_token` - Telegram Bot Token
- `telegram_chat_id` - 接收提醒的 Chat ID
- `notify_time` - 每日提醒时间(如 "09:00")
- `default_notify_days` - 默认提醒天数 [7,3,1]

---

## 四、API 设计

### 4.1 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| GET | /api/auth/me | 获取当前用户信息 |
| PUT | /api/auth/password | 修改密码 |

### 4.2 分类管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/categories | 获取分类列表 |
| POST | /api/categories | 创建分类 |
| PUT | /api/categories/{id} | 更新分类 |
| DELETE | /api/categories/{id} | 删除分类 |

### 4.3 服务管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/subscriptions | 获取服务列表(支持筛选分页) |
| GET | /api/subscriptions/{id} | 获取服务详情 |
| POST | /api/subscriptions | 创建服务 |
| PUT | /api/subscriptions/{id} | 更新服务 |
| DELETE | /api/subscriptions/{id} | 删除服务 |
| POST | /api/subscriptions/{id}/renew | 标记续费 |

### 4.4 统计相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/stats/overview | 获取概览统计 |
| GET | /api/stats/expiring | 获取即将到期服务 |
| GET | /api/stats/calendar | 获取日历数据 |
| GET | /api/stats/costs | 获取费用统计 |

### 4.5 系统设置

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/settings | 获取系统设置 |
| PUT | /api/settings | 更新系统设置 |
| POST | /api/settings/test-telegram | 测试 Telegram 连接 |

### 4.6 提醒记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/notifications | 获取提醒历史 |

---

## 五、页面设计

### 5.1 页面列表

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录页 | /login | 用户登录 |
| 仪表盘 | / | 首页概览 |
| 服务列表 | /subscriptions | 全部服务管理 |
| 日历视图 | /calendar | 月历展示到期分布 |
| 费用统计 | /costs | 费用图表分析 |
| 分类管理 | /categories | 管理分类 |
| 系统设置 | /settings | 系统配置 |

### 5.2 仪表盘组件

- **统计卡片**：总服务数、本月到期、本月费用、即将到期
- **快到期列表**：最近7天内到期的服务
- **分类分布图**：饼图展示各分类服务数量
- **费用趋势图**：近6个月费用走势

### 5.3 交互流程

```
登录 → 仪表盘(首页)
         ├→ 服务列表 → 添加/编辑/删除/标记续费
         ├→ 日历视图 → 点击日期查看当日到期服务
         ├→ 费用统计 → 切换月度/年度视图
         ├→ 分类管理 → 增删改分类
         └→ 系统设置 → 配置Telegram/修改密码
```

---

## 六、部署方案

### 6.1 环境要求

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Nginx (反向代理)

### 6.2 目录结构

```
/opt/subtracker/
├── backend/           # FastAPI 后端
│   ├── venv/          # Python 虚拟环境
│   └── ...
├── frontend/          # React 前端构建产物
│   └── dist/
├── logs/              # 日志目录
└── .env               # 环境变量配置
```

### 6.3 部署步骤

1. **安装依赖**
   - 安装 Python 3.11+
   - 安装 PostgreSQL 15+
   - 安装 Nginx

2. **配置数据库**
   - 创建数据库和用户
   - 运行数据库迁移

3. **部署后端**
   - 创建虚拟环境
   - 安装 Python 依赖
   - 配置环境变量
   - 使用 systemd 管理进程

4. **部署前端**
   - 构建 React 项目
   - 将构建产物放入 Nginx 目录

5. **配置 Nginx**
   - 配置静态文件服务
   - 配置 API 反向代理

### 6.4 Systemd 服务配置

```ini
[Unit]
Description=SubTracker Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/subtracker/backend
Environment="PATH=/opt/subtracker/backend/venv/bin"
ExecStart=/opt/subtracker/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 七、开发计划

### Phase 1 - 核心功能
- [ ] 项目初始化（后端 + 前端）
- [ ] 数据库设计和迁移
- [ ] 用户认证（登录/JWT）
- [ ] 分类 CRUD
- [ ] 服务 CRUD
- [ ] 基础列表页面

### Phase 2 - 提醒功能
- [ ] Telegram Bot 集成
- [ ] 定时任务（APScheduler）
- [ ] 提醒记录

### Phase 3 - 增强功能
- [ ] 仪表盘统计
- [ ] 日历视图
- [ ] 费用统计图表
- [ ] 搜索和筛选

### Phase 4 - 完善部署
- [ ] 部署文档
- [ ] 初始化脚本
- [ ] 日志配置
