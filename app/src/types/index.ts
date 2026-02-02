// 服务状态
export type ServiceStatus = 'active' | 'expired' | 'expiring' | 'expiring-soon';

// 计费周期
export type BillingCycle = 'monthly' | 'yearly' | 'quarterly';

// 货币类型
export type Currency = 'CNY' | 'USD';

// 服务
export interface Service {
  id: string;
  name: string;
  categoryId: string;
  provider: string;
  cost: number;
  currency: Currency;
  billingCycle: BillingCycle;
  startDate: string;
  expiryDate: string;
  status: ServiceStatus;
  notes?: string;
}

// 分类
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  serviceCount: number;
}

// 用户设置
export interface UserSettings {
  telegramBotToken?: string;
  telegramChatId?: string;
  reminderTime: string;
  reminderDays: number[];
  defaultCurrency: Currency;
  exchangeRate: number;
}

// 用户
export interface User {
  id: string;
  username: string;
  avatar?: string;
}

// 提醒记录
export interface ReminderLog {
  id: string;
  serviceId: string;
  serviceName: string;
  sentAt: string;
  daysBeforeExpiry: number;
  status: 'sent' | 'failed';
}

// 统计卡片数据
export interface StatCardData {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
  color: string;
}

// 费用数据
export interface ExpenseData {
  month: string;
  CNY: number;
  USD: number;
}

// 分类分布数据
export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

// 费用明细
export interface ExpenseDetail {
  category: string;
  categoryColor: string;
  amount: number;
  currency: Currency;
  percentage: number;
}

// 日历事件
export interface CalendarEvent {
  date: string;
  services: {
    id: string;
    name: string;
    categoryColor: string;
    daysLeft: number;
  }[];
}

// 导航项
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  group?: string;
}
