import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service, Category, UserSettings, User, ReminderLog } from '@/types';
import { api, useApi, getToken, setToken } from '@/lib/api';

interface AppState {
  // 用户认证
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuth: (v: boolean) => void;
  loadFromApi: () => Promise<void>;

  // 服务列表
  services: Service[];
  addService: (service: Omit<Service, 'id' | 'status'>) => void | Promise<void>;
  updateService: (id: string, service: Partial<Service>) => void | Promise<void>;
  deleteService: (id: string) => void | Promise<void>;
  renewService: (id: string) => void | Promise<void>;
  getServiceById: (id: string) => Service | undefined;

  // 分类
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'order' | 'serviceCount'>) => void | Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => void | Promise<void>;
  deleteCategory: (id: string) => void | Promise<void>;
  reorderCategories: (startIndex: number, endIndex: number) => void;
  getCategoryById: (id: string) => Category | undefined;

  // 设置
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void | Promise<void>;

  // 提醒记录
  reminderLogs: ReminderLog[];
  addReminderLog: (log: Omit<ReminderLog, 'id' | 'sentAt'>) => void;

  // 统计数据
  getDashboardStats: () => {
    totalServices: number;
    expiringThisMonth: number;
    monthlyExpense: { CNY: number; USD: number };
    activeServices: number;
  };
  getExpiringServices: (days: number) => Service[];
  getCategoryDistribution: () => { name: string; value: number; color: string }[];
  getExpenseTrend: (months: number) => { month: string; CNY: number; USD: number }[];
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 计算服务状态
const calculateServiceStatus = (expiryDate: string): Service['status'] => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'expiring';
  if (diffDays <= 7) return 'expiring-soon';
  return 'active';
};

// 初始数据
const initialCategories: Category[] = [
  { id: '1', name: '视频流媒体', color: '#E53935', icon: 'Play', order: 0, serviceCount: 3 },
  { id: '2', name: '音乐音频', color: '#1E88E5', icon: 'Music', order: 1, serviceCount: 2 },
  { id: '3', name: '办公软件', color: '#43A047', icon: 'Briefcase', order: 2, serviceCount: 4 },
  { id: '4', name: '云存储', color: '#FB8C00', icon: 'Cloud', order: 3, serviceCount: 2 },
  { id: '5', name: '开发工具', color: '#8E24AA', icon: 'Code', order: 4, serviceCount: 3 },
];

const initialServices: Service[] = [
  {
    id: '1',
    name: 'Netflix',
    categoryId: '1',
    provider: 'Netflix Inc.',
    cost: 45,
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '2024-01-15',
    expiryDate: '2025-02-15',
    status: 'active',
    notes: '4K 套餐',
  },
  {
    id: '2',
    name: 'Spotify',
    categoryId: '2',
    provider: 'Spotify AB',
    cost: 19,
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '2024-03-01',
    expiryDate: '2025-02-01',
    status: 'expiring',
    notes: '个人套餐',
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    categoryId: '3',
    provider: 'Adobe Inc.',
    cost: 888,
    currency: 'CNY',
    billingCycle: 'yearly',
    startDate: '2024-06-01',
    expiryDate: '2025-06-01',
    status: 'active',
    notes: '全部应用',
  },
  {
    id: '4',
    name: 'iCloud+',
    categoryId: '4',
    provider: 'Apple Inc.',
    cost: 68,
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '2024-01-01',
    expiryDate: '2025-02-05',
    status: 'expiring-soon',
    notes: '2TB 存储',
  },
  {
    id: '5',
    name: 'GitHub Pro',
    categoryId: '5',
    provider: 'GitHub Inc.',
    cost: 19,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2024-02-01',
    expiryDate: '2025-02-10',
    status: 'expiring-soon',
    notes: '个人开发者',
  },
  {
    id: '6',
    name: 'Microsoft 365',
    categoryId: '3',
    provider: 'Microsoft',
    cost: 399,
    currency: 'CNY',
    billingCycle: 'yearly',
    startDate: '2024-09-01',
    expiryDate: '2025-09-01',
    status: 'active',
    notes: '家庭版',
  },
  {
    id: '7',
    name: 'YouTube Premium',
    categoryId: '1',
    provider: 'Google',
    cost: 68,
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '2024-04-01',
    expiryDate: '2025-02-20',
    status: 'active',
    notes: '个人版',
  },
  {
    id: '8',
    name: 'Notion',
    categoryId: '3',
    provider: 'Notion Labs',
    cost: 10,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2024-05-01',
    expiryDate: '2025-02-28',
    status: 'active',
    notes: 'Plus 套餐',
  },
];

const initialSettings: UserSettings = {
  reminderTime: '09:00',
  reminderDays: [7, 3, 1],
  defaultCurrency: 'CNY',
  exchangeRate: 7.2,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户认证
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      setAuth: (v) => set({ isAuthenticated: v }),
      loadFromApi: async () => {
        const [me, cats, subs, sets, notifs] = await Promise.all([
          api.auth.me(),
          api.categories.list(),
          api.subscriptions.list(),
          api.settings.get(),
          api.notifications.list(50),
        ]);
        set({
          user: { id: String(me.id), username: me.username, avatar: undefined },
          isAuthenticated: true,
          categories: cats as Category[],
          services: subs as Service[],
          settings: {
            reminderTime: sets.notify_time,
            reminderDays: sets.default_notify_days,
            defaultCurrency: sets.default_currency,
            exchangeRate: sets.exchange_rate,
            telegramBotToken: sets.telegram_bot_token,
            telegramChatId: sets.telegram_chat_id,
          },
          reminderLogs: (notifs || []).map((n) => ({
            id: n.id,
            serviceId: n.subscription_id,
            serviceName: '',
            sentAt: n.sent_at,
            daysBeforeExpiry: parseInt(n.notify_type, 10) || 0,
            status: n.success ? ('sent' as const) : ('failed' as const),
          })),
        });
      },
      login: async (username: string, password: string) => {
        if (useApi()) {
          try {
            const res = await api.auth.login(username, password);
            setToken(res.access_token);
            await get().loadFromApi();
            return true;
          } catch {
            setToken(null);
            return false;
          }
        }
        if (username === 'admin' && password === 'admin') {
          set({
            user: { id: '1', username: 'admin', avatar: undefined },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      logout: () => {
        setToken(null);
        set({ user: null, isAuthenticated: false });
      },

      // 服务列表
      services: initialServices,
      addService: async (service) => {
        if (useApi()) {
          const created = await api.subscriptions.create(service as Parameters<typeof api.subscriptions.create>[0]);
          set((state) => ({ services: [...state.services, created as Service] }));
          return;
        }
        const newService: Service = {
          ...service,
          id: generateId(),
          status: calculateServiceStatus(service.expiryDate),
        };
        set((state) => ({
          services: [...state.services, newService],
        }));
      },
      updateService: async (id, service) => {
        if (useApi()) {
          const updated = await api.subscriptions.update(id, service as Record<string, unknown>);
          set((state) => ({
            services: state.services.map((s) => (s.id === id ? (updated as Service) : s)),
          }));
          return;
        }
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id
              ? { ...s, ...service, status: service.expiryDate ? calculateServiceStatus(service.expiryDate) : s.status }
              : s
          ),
        }));
      },
      deleteService: async (id) => {
        if (useApi()) {
          await api.subscriptions.delete(id);
          set((state) => ({ services: state.services.filter((s) => s.id !== id) }));
          return;
        }
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        }));
      },
      renewService: async (id) => {
        if (useApi()) {
          const renewed = await api.subscriptions.renew(id);
          set((state) => ({
            services: state.services.map((s) => (s.id === id ? (renewed as Service) : s)),
          }));
          return;
        }
        const service = get().services.find((s) => s.id === id);
        if (!service) return;

        const expiryDate = new Date(service.expiryDate);
        const newExpiryDate = new Date(expiryDate);

        switch (service.billingCycle) {
          case 'monthly':
            newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
            break;
          case 'quarterly':
            newExpiryDate.setMonth(newExpiryDate.getMonth() + 3);
            break;
          case 'yearly':
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
            break;
        }

        get().updateService(id, {
          expiryDate: newExpiryDate.toISOString().split('T')[0],
        });
      },
      getServiceById: (id) => {
        return get().services.find((s) => s.id === id);
      },

      // 分类
      categories: initialCategories,
      addCategory: async (category) => {
        if (useApi()) {
          const created = await api.categories.create(category);
          set((state) => ({ categories: [...state.categories, created as Category] }));
          return;
        }
        const newCategory: Category = {
          ...category,
          id: generateId(),
          order: get().categories.length,
          serviceCount: 0,
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },
      updateCategory: async (id, category) => {
        if (useApi()) {
          const existing = get().getCategoryById(id);
          const updated = await api.categories.update(id, {
            name: category.name,
            color: category.color,
            icon: category.icon,
            sort_order: category.order ?? existing?.order,
          });
          set((state) => ({
            categories: state.categories.map((c) => (c.id === id ? (updated as Category) : c)),
          }));
          return;
        }
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c)),
        }));
      },
      deleteCategory: async (id) => {
        if (useApi()) {
          await api.categories.delete(id);
          set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
          return;
        }
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },
      reorderCategories: (startIndex, endIndex) => {
        set((state) => {
          const categories = [...state.categories];
          const [removed] = categories.splice(startIndex, 1);
          categories.splice(endIndex, 0, removed);
          return {
            categories: categories.map((c, i) => ({ ...c, order: i })),
          };
        });
      },
      getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id);
      },

      // 设置
      settings: initialSettings,
      updateSettings: async (settings) => {
        if (useApi()) {
          await api.settings.update({
            telegram_bot_token: settings.telegramBotToken,
            telegram_chat_id: settings.telegramChatId,
            notify_time: settings.reminderTime,
            default_notify_days: settings.reminderDays,
            default_currency: settings.defaultCurrency,
            exchange_rate: settings.exchangeRate,
          });
        }
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      // 提醒记录
      reminderLogs: [],
      addReminderLog: (log) => {
        const newLog: ReminderLog = {
          ...log,
          id: generateId(),
          sentAt: new Date().toISOString(),
        };
        set((state) => ({
          reminderLogs: [newLog, ...state.reminderLogs],
        }));
      },

      // 统计数据
      getDashboardStats: () => {
        const services = get().services;
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const expiringThisMonth = services.filter((s) => {
          const expiry = new Date(s.expiryDate);
          return expiry <= endOfMonth && expiry >= today;
        }).length;

        const monthlyExpense = services
          .filter((s) => s.status !== 'expired')
          .reduce(
            (acc, s) => {
              let monthlyCost = s.cost;
              if (s.billingCycle === 'yearly') monthlyCost /= 12;
              if (s.billingCycle === 'quarterly') monthlyCost /= 3;

              if (s.currency === 'CNY') {
                acc.CNY += monthlyCost;
              } else {
                acc.USD += monthlyCost;
              }
              return acc;
            },
            { CNY: 0, USD: 0 }
          );

        const activeServices = services.filter((s) => s.status === 'active').length;

        return {
          totalServices: services.length,
          expiringThisMonth,
          monthlyExpense: {
            CNY: Math.round(monthlyExpense.CNY * 100) / 100,
            USD: Math.round(monthlyExpense.USD * 100) / 100,
          },
          activeServices,
        };
      },
      getExpiringServices: (days) => {
        const services = get().services;
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + days);

        return services
          .filter((s) => {
            const expiry = new Date(s.expiryDate);
            return expiry <= targetDate && expiry >= today;
          })
          .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      },
      getCategoryDistribution: () => {
        const categories = get().categories;
        const services = get().services;

        return categories
          .map((cat) => ({
            name: cat.name,
            value: services.filter((s) => s.categoryId === cat.id).length,
            color: cat.color,
          }))
          .filter((cat) => cat.value > 0);
      },
      getExpenseTrend: (months) => {
        const services = get().services;
        const result = [];
        const today = new Date();

        for (let i = months - 1; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

          const monthlyExpense = services
            .filter((s) => {
              const start = new Date(s.startDate);
              const expiry = new Date(s.expiryDate);
              return start <= date && expiry >= date;
            })
            .reduce(
              (acc, s) => {
                let monthlyCost = s.cost;
                if (s.billingCycle === 'yearly') monthlyCost /= 12;
                if (s.billingCycle === 'quarterly') monthlyCost /= 3;

                if (s.currency === 'CNY') {
                  acc.CNY += monthlyCost;
                } else {
                  acc.USD += monthlyCost;
                }
                return acc;
              },
              { CNY: 0, USD: 0 }
            );

          result.push({
            month: `${date.getMonth() + 1}月`,
            CNY: Math.round(monthlyExpense.CNY * 100) / 100,
            USD: Math.round(monthlyExpense.USD * 100) / 100,
          });
        }

        return result;
      },
    }),
    {
      name: 'subtracker-storage',
      partialize: (state) => ({
        services: state.services,
        categories: state.categories,
        settings: state.settings,
        reminderLogs: state.reminderLogs,
      }),
    }
  )
);
