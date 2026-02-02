# SubTracker 订阅服务管理系统

---

## 整体风格

- **专业管理工具美学**：简洁、高效的企业级管理界面，注重信息的清晰展示和操作效率
- **低饱和度配色**：以蓝灰色系为主，搭配状态色（红/黄/绿）传递到期状态信息
- **卡片式布局**：通过卡片组件组织信息，层次分明，易于扫视
- **数据可视化**：通过图表和日历直观展示订阅服务的费用和到期分布
- **响应式设计**：适配桌面端和移动端，确保各设备上的良好体验

---

## 排版结构

### 1. 侧边导航栏
- 左侧固定侧边栏，宽度 240px，背景为深蓝灰色 (#1e293b)
- 顶部放置 "SubTracker" 品牌 Logo，使用白色粗体无衬线字体
- 导航项包含图标 + 文字，分组排列：
  - 主菜单：仪表盘、服务列表、日历视图、费用统计
  - 管理：分类管理、系统设置
- 当前页面高亮显示，hover 时背景变为半透明白色
- 底部显示用户信息和登出按钮

### 2. 顶部栏
- 页面标题显示当前所在页面名称
- 右侧放置全局搜索框和快捷操作按钮（添加服务）
- 可选：显示通知铃铛图标，提示即将到期服务数量

### 3. 仪表盘页面（首页）
- **统计卡片区**（4列网格）：
  - 总服务数（蓝色图标）
  - 本月到期（红色图标，数字醒目）
  - 本月费用（绿色图标）
  - 活跃服务数（紫色图标）
- **快到期服务列表**（左侧，占 60% 宽度）：
  - 表格形式展示最近 7 天内到期的服务
  - 列：服务名称、分类标签、到期日期、剩余天数（红/黄/绿状态色）
  - 支持快捷续费操作按钮
- **分类分布饼图**（右侧上方）：
  - 展示各分类的服务数量占比
  - 使用分类自定义颜色
- **费用趋势折线图**（右侧下方）：
  - 展示近 6 个月的月度费用趋势
  - 区分不同货币（CNY/USD）

### 4. 服务列表页面
- 顶部筛选栏：分类下拉、状态筛选、搜索框、添加按钮
- 表格展示所有服务：
  - 列：服务名称、分类（彩色标签）、服务商、费用、计费周期、到期日期、状态、操作
  - 支持列排序（点击表头）
  - 到期状态用颜色区分：已过期（红）、7天内（橙）、30天内（黄）、正常（绿）
- 分页组件在表格底部
- 点击行可展开查看详细信息和备注

### 5. 日历视图页面
- 月历组件占据主要区域
- 有到期服务的日期显示圆点标记（颜色对应分类）
- 点击日期弹出当日到期服务列表
- 支持月份切换导航
- 侧边栏显示当月到期服务汇总

### 6. 费用统计页面
- 顶部切换：月度视图 / 年度视图
- 柱状图：按月/按年展示费用分布
- 饼图：按分类展示费用占比
- 费用明细表格：按分类或服务商汇总
- 支持货币切换（CNY/USD）和汇率换算

### 7. 分类管理页面
- 卡片网格展示所有分类
- 每张卡片显示：分类名称、颜色条、图标、服务数量
- 支持拖拽排序
- 添加/编辑分类弹窗：名称、颜色选择器、图标选择

### 8. 系统设置页面
- 分组设置卡片：
  - **Telegram 配置**：Bot Token、Chat ID、测试连接按钮
  - **提醒设置**：每日提醒时间、默认提醒天数
  - **账户设置**：修改密码

### 9. 登录页面
- 居中卡片式登录表单
- Logo + 系统名称
- 用户名、密码输入框
- 登录按钮
- 简洁背景，可使用渐变或几何图案


### 表单
- 输入框：白色背景，灰色边框，圆角 6px，focus 时蓝色边框
- 下拉选择：与输入框风格一致
- 日期选择器：弹出日历组件

### 卡片
- 白色背景，圆角 8px，轻微阴影（shadow-sm）
- 内边距 16-24px
- 卡片间距 16px

### 标签/Badge
- 圆角胶囊形状
- 分类标签使用分类颜色
- 状态标签使用状态色

### 弹窗/Modal
- 居中显示，带遮罩层
- 白色背景，圆角 12px
- 顶部标题 + 关闭按钮
- 底部操作按钮区

---

## 功能描述

### 1. 核心功能

**服务管理**
- 添加订阅服务：填写名称、选择分类、服务商、费用、货币、计费周期、到期日期、备注
- 编辑服务：修改服务的任意字段
- 删除服务：二次确认后删除
- 续费确认：一键标记续费，自动根据计费周期计算新到期日期
- 批量操作：支持批量删除、批量修改分类

**分类管理**
- 创建自定义分类：名称、颜色、图标
- 编辑分类：修改分类属性
- 删除分类：检查是否有关联服务，提示迁移
- 拖拽排序：调整分类显示顺序

**到期提醒**
- 配置 Telegram Bot Token 和 Chat ID
- 设置每日提醒时间
- 配置提醒节点（默认 7天、3天、1天）
- 查看提醒历史记录

### 2. 数据展示

**仪表盘**
- 关键指标统计卡片
- 即将到期服务预警列表
- 分类分布可视化
- 费用趋势图表

**日历视图**
- 按月展示到期分布
- 直观查看到期时间安排
- 快速跳转到特定日期

**费用统计**
- 月度/年度费用报表
- 分类费用占比分析
- 服务商费用汇总
- 多货币支持

### 3. 交互体验

- 表格支持搜索、筛选、排序、分页
- 表单支持实时验证
- 操作后显示成功/失败提示（Toast）
- 删除操作需二次确认
- 支持键盘快捷键（如 Ctrl+K 打开搜索）
- 页面切换使用平滑过渡动画
- 加载状态显示骨架屏或 Loading 指示器

---

## 技术要求

### 前端技术栈
- **框架**：React 18 + TypeScript
- **路由**：React Router v6
- **状态管理**：Zustand 或 React Query
- **UI 框架**：TailwindCSS + Headless UI
- **图表库**：Recharts 或 Chart.js
- **日历组件**：react-big-calendar 或 FullCalendar
- **表单**：React Hook Form + Zod 验证
- **HTTP 请求**：Axios
- **图标**：Lucide React 或 Heroicons

### 后端技术栈
- **框架**：Python 3.11+ + FastAPI
- **ORM**：SQLAlchemy 2.0
- **数据库**：PostgreSQL 15+
- **认证**：JWT (python-jose)
- **定时任务**：APScheduler
- **消息推送**：Telegram Bot API (python-telegram-bot)

### 代码规范
- 使用 ESLint + Prettier 格式化前端代码
- 使用 Black + isort 格式化 Python 代码
- 组件采用函数式写法 + Hooks
- API 使用 RESTful 风格
- 统一的错误处理和响应格式

---

## 响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| mobile | < 640px | 侧边栏收起为汉堡菜单，单列布局 |
| tablet | 640px - 1024px | 侧边栏可折叠，2列网格 |
| desktop | > 1024px | 完整侧边栏，多列网格 |

---

## 页面交互流程

```
登录页 → 仪表盘（首页）
              ├→ 点击"添加服务" → 弹出添加表单 → 保存 → 刷新列表
              ├→ 点击"查看全部" → 跳转服务列表页
              ├→ 点击即将到期服务 → 跳转服务详情/编辑
              │
服务列表 ←───┘
              ├→ 筛选/搜索 → 更新列表
              ├→ 点击服务行 → 展开详情
              ├→ 点击编辑 → 弹出编辑表单
              ├→ 点击删除 → 确认弹窗 → 删除
              ├→ 点击续费 → 确认新到期日 → 更新
              │
日历视图 ←───→ 点击日期 → 显示当日到期服务
              │
费用统计 ←───→ 切换月度/年度 → 更新图表
              │
分类管理 ←───→ 添加/编辑/删除/排序分类
              │
系统设置 ←───→ 配置 Telegram → 测试连接
              └→ 修改密码 → 重新登录
```

---

## 数据库表结构

### users（用户表）
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### categories（分类表）
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#64748b',
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### subscriptions（订阅服务表）
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES categories(id),
    provider VARCHAR(100),
    cost DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'CNY',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    expire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    notify_days JSONB DEFAULT '[7,3,1]',
    url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### notifications（提醒记录表）
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id),
    notify_type VARCHAR(20) NOT NULL,
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);
```

### settings（系统设置表）
```sql
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API 接口概览

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户
- `PUT /api/auth/password` - 修改密码

### 分类
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/{id}` - 更新分类
- `DELETE /api/categories/{id}` - 删除分类

### 订阅服务
- `GET /api/subscriptions` - 获取服务列表（支持筛选分页）
- `GET /api/subscriptions/{id}` - 获取服务详情
- `POST /api/subscriptions` - 创建服务
- `PUT /api/subscriptions/{id}` - 更新服务
- `DELETE /api/subscriptions/{id}` - 删除服务
- `POST /api/subscriptions/{id}/renew` - 标记续费

### 统计
- `GET /api/stats/overview` - 概览统计
- `GET /api/stats/expiring` - 即将到期服务
- `GET /api/stats/calendar` - 日历数据
- `GET /api/stats/costs` - 费用统计

### 系统设置
- `GET /api/settings` - 获取设置
- `PUT /api/settings` - 更新设置
- `POST /api/settings/test-telegram` - 测试 Telegram

### 提醒记录
- `GET /api/notifications` - 提醒历史

---

## 初始化数据

### 默认分类
1. 云服务器 - #3b82f6 (蓝) - Server 图标
2. 域名 - #8b5cf6 (紫) - Globe 图标
3. RPC节点 - #06b6d4 (青) - Cpu 图标
4. SaaS服务 - #f59e0b (橙) - Cloud 图标
5. 其他 - #64748b (灰) - MoreHorizontal 图标

### 默认设置
- `notify_time`: "09:00"
- `default_notify_days`: [7, 3, 1]

### 默认管理员
- 用户名: admin
- 密码: admin123（首次登录后强制修改）
