# SubTracker 技术规格文档

## 组件清单

### shadcn/ui 内置组件
| 组件 | 用途 |
|------|------|
| Button | 按钮交互 |
| Card | 卡片容器 |
| Input | 输入框 |
| Label | 表单标签 |
| Badge | 状态标签 |
| Dialog | 弹窗 |
| DropdownMenu | 下拉菜单 |
| Select | 选择器 |
| Table | 表格 |
| Tabs | 标签页切换 |
| Calendar | 日历组件 |
| Popover | 气泡卡片 |
| Tooltip | 提示 |
| Separator | 分隔线 |
| Skeleton | 骨架屏 |
| Toast | 消息提示 |
| Switch | 开关 |
| Checkbox | 复选框 |
| RadioGroup | 单选组 |
| Accordion | 手风琴 |
| Avatar | 头像 |

### 第三方组件
| 组件 | 来源 | 用途 |
|------|------|------|
| Recharts | npm | 图表（折线图、饼图、柱状图） |
| react-beautiful-dnd | npm | 拖拽排序 |
| date-fns | npm | 日期处理 |

### 自定义组件
| 组件 | 说明 |
|------|------|
| Sidebar | 侧边导航栏 |
| TopBar | 顶部栏 |
| StatCard | 统计卡片 |
| ServiceTable | 服务列表表格 |
| CategoryBadge | 分类标签 |
| StatusBadge | 状态标签 |
| ExpenseChart | 费用趋势图 |
| CategoryPieChart | 分类饼图 |
| CalendarView | 日历视图 |
| DraggableCategoryCard | 可拖拽分类卡片 |

## 动画实现方案

| 动画 | 库 | 实现方式 | 复杂度 |
|------|------|----------|--------|
| 页面过渡 | Framer Motion | AnimatePresence + motion.div | 中 |
| 侧边栏展开/收起 | Framer Motion | animate width/opacity | 低 |
| 统计卡片数字滚动 | Framer Motion | useSpring + useInView | 中 |
| 表格行悬停 | CSS/Tailwind | hover:bg-gray-50 transition | 低 |
| 按钮悬停效果 | CSS/Tailwind | hover:scale-105 transition | 低 |
| 弹窗动画 | Framer Motion | scale + opacity animation | 低 |
| 图表动画 | Recharts | 内置动画配置 | 低 |
| 日历标记动画 | CSS | pulse animation | 低 |
| 拖拽排序 | react-beautiful-dnd | 内置动画 | 中 |
| Toast 提示 | Framer Motion | slideIn + fadeOut | 低 |
| 加载骨架屏 | shadcn Skeleton | 内置动画 | 低 |
| 标签页切换 | Framer Motion | layoutId underline | 中 |

## 项目文件结构

```
/mnt/okcomputer/output/app/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui 组件
│   │   ├── layout/                # 布局组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── dashboard/             # 仪表盘组件
│   │   │   ├── StatCard.tsx
│   │   │   ├── ExpiringList.tsx
│   │   │   ├── CategoryChart.tsx
│   │   │   └── ExpenseTrend.tsx
│   │   ├── services/              # 服务列表组件
│   │   │   ├── ServiceTable.tsx
│   │   │   ├── ServiceFilter.tsx
│   │   │   └── ServiceForm.tsx
│   │   ├── calendar/              # 日历组件
│   │   │   ├── CalendarView.tsx
│   │   │   └── EventPopover.tsx
│   │   ├── statistics/            # 统计组件
│   │   │   ├── ExpenseBarChart.tsx
│   │   │   ├── CategoryPieChart.tsx
│   │   │   └── ExpenseDetailTable.tsx
│   │   ├── categories/            # 分类管理组件
│   │   │   ├── CategoryCard.tsx
│   │   │   └── CategoryForm.tsx
│   │   └── settings/              # 设置组件
│   │       ├── TelegramConfig.tsx
│   │       ├── ReminderSettings.tsx
│   │       └── AccountSettings.tsx
│   ├── pages/                     # 页面
│   │   ├── Dashboard.tsx
│   │   ├── Services.tsx
│   │   ├── Calendar.tsx
│   │   ├── Statistics.tsx
│   │   ├── Categories.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── hooks/                     # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useServices.ts
│   │   ├── useCategories.ts
│   │   └── useStatistics.ts
│   ├── store/                     # 状态管理
│   │   └── index.ts
│   ├── types/                     # TypeScript 类型
│   │   └── index.ts
│   ├── lib/                       # 工具函数
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 依赖安装

```bash
# 核心动画库
npm install framer-motion

# 图表库
npm install recharts

# 日期处理
npm install date-fns

# 拖拽排序
npm install react-beautiful-dnd @types/react-beautiful-dnd

# 图标
npm install lucide-react
```

## 颜色配置

```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#4382FF',
    50: '#E3F2FD',
    100: '#BBDEFB',
    500: '#4382FF',
    600: '#357ABD',
  },
  sidebar: '#1e293b',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#333333',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  border: '#E0E0E0',
}
```

## 路由结构

```typescript
// 路由配置
const routes = [
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/services', element: <Services /> },
      { path: '/calendar', element: <Calendar /> },
      { path: '/statistics', element: <Statistics /> },
      { path: '/categories', element: <Categories /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
];
```

## 数据结构

```typescript
// 服务
interface Service {
  id: string;
  name: string;
  categoryId: string;
  provider: string;
  cost: number;
  currency: 'CNY' | 'USD';
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  startDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'expiring';
  notes?: string;
}

// 分类
interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
}

// 用户设置
interface Settings {
  telegramBotToken?: string;
  telegramChatId?: string;
  reminderTime: string;
  reminderDays: number[];
  defaultCurrency: 'CNY' | 'USD';
}
```

## 响应式断点

```typescript
// Tailwind 默认断点
sm: '640px'   // 手机横屏
md: '768px'   // 平板
lg: '1024px'  // 小桌面
xl: '1280px'  // 桌面
2xl: '1536px' // 大桌面
```

## 性能优化

1. **组件懒加载**: 使用 React.lazy 和 Suspense
2. **图表懒加载**: 进入视口后再渲染
3. **虚拟滚动**: 长列表使用虚拟滚动
4. **防抖节流**: 搜索和滚动事件
5. **Memoization**: 使用 useMemo 和 useCallback
