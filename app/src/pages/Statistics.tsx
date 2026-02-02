import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store';

export function Statistics() {
  const [currency, setCurrency] = useState<'CNY' | 'USD'>('CNY');
  const { services, categories, settings } = useAppStore();

  // 当日 key（YYYY-MM），用于 monthlyData 依赖，跨天后重新计算“近 6 个月”
  const [todayMonthKey, setTodayMonthKey] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  useEffect(() => {
    const check = () => {
      const d = new Date();
      const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      setTodayMonthKey((prev) => (next !== prev ? next : prev));
    };
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  // 近 6 个月每月「在计费期内」的费用（按当月是否在 start～expiry 之间归集，不是按开始月）
  const monthlyData = useMemo(() => {
    const data: Record<string, { CNY: number; USD: number }> = {};
    const today = new Date();

    // 先确定近 6 个月的 key 并初始化为 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      data[key] = { CNY: 0, USD: 0 };
    }

    services.forEach((service) => {
      if (!service.startDate) return;
      const startDate = new Date(service.startDate);
      if (Number.isNaN(startDate.getTime())) return;
      const expiryDate = service.expiryDate ? new Date(service.expiryDate) : null;
      if (expiryDate && Number.isNaN(expiryDate.getTime())) return;

      let monthlyCost = Number(service.cost) || 0;
      if (service.billingCycle === 'yearly') monthlyCost /= 12;
      if (service.billingCycle === 'quarterly') monthlyCost /= 3;

      // 对近 6 个月逐月判断：该月是否在订阅有效期内，是则计入当月
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
        const activeInMonth = startDate <= monthEnd && (!expiryDate || expiryDate >= monthStart);
        if (!activeInMonth) continue;
        if (service.currency === 'CNY') {
          data[key].CNY += monthlyCost;
        } else {
          data[key].USD += monthlyCost;
        }
      }
    });

    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({
        month: `${parseInt(month.split('-')[1])}月`,
        CNY: Math.round(values.CNY * 100) / 100,
        USD: Math.round(values.USD * 100) / 100,
      }));
  }, [services, todayMonthKey]);

  // Calculate category expenses
  const categoryData = useMemo(() => {
    const data: Record<string, { name: string; value: number; color: string }> = {};
    const rate = Number(settings?.exchangeRate) || 7.2;

    categories.forEach((cat) => {
      data[cat.id] = { name: cat.name, value: 0, color: cat.color };
    });

    services.forEach((service) => {
      if (service.categoryId && data[service.categoryId]) {
        let cost = Number(service.cost) || 0;
        if (service.billingCycle === 'yearly') cost /= 12;
        if (service.billingCycle === 'quarterly') cost /= 3;

        if (service.currency === currency) {
          data[service.categoryId].value += cost;
        } else if (service.currency === 'CNY' && currency === 'USD') {
          data[service.categoryId].value += cost / rate;
        } else if (service.currency === 'USD' && currency === 'CNY') {
          data[service.categoryId].value += cost * rate;
        }
      }
    });

    return Object.values(data)
      .filter((item) => item.value > 0)
      .map((item) => ({ ...item, value: Math.round(item.value * 100) / 100 }));
  }, [services, categories, currency, settings?.exchangeRate]);

  // Calculate totals（API 可能返回 string/Decimal，统一转为 number）
  const totals = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        let cost = Number(service.cost) || 0;
        if (service.billingCycle === 'yearly') cost /= 12;
        if (service.billingCycle === 'quarterly') cost /= 3;

        if (service.currency === 'CNY') {
          acc.CNY += cost;
        } else {
          acc.USD += cost;
        }
        return acc;
      },
      { CNY: 0, USD: 0 }
    );
  }, [services]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {currency === 'CNY' ? '¥' : '$'}
              {(Number(entry.value) || 0).toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#4382FF]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#4382FF]" />
            </div>
            <span className="text-sm text-gray-500">月度总费用 (CNY)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">¥{(Number(totals.CNY) || 0).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#4CAF50]" />
            </div>
            <span className="text-sm text-gray-500">月度总费用 (USD)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${(Number(totals.USD) || 0).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#8E24AA]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#8E24AA]" />
            </div>
            <span className="text-sm text-gray-500">平均月费 (CNY)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{services.length > 0 ? ((Number(totals.CNY) || 0) / services.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#4382FF]" />
              <h3 className="text-lg font-semibold text-gray-900">费用趋势</h3>
            </div>
            <Tabs value={currency} onValueChange={(v) => setCurrency(v as 'CNY' | 'USD')}>
              <TabsList className="h-8">
                <TabsTrigger value="CNY" className="text-xs px-3">CNY</TabsTrigger>
                <TabsTrigger value="USD" className="text-xs px-3">USD</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `${currency === 'CNY' ? '¥' : '$'}${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={currency}
                  fill={currency === 'CNY' ? '#4382FF' : '#4CAF50'}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#4382FF]" />
              <h3 className="text-lg font-semibold text-gray-900">分类占比</h3>
            </div>
            <Tabs value={currency} onValueChange={(v) => setCurrency(v as 'CNY' | 'USD')}>
              <TabsList className="h-8">
                <TabsTrigger value="CNY" className="text-xs px-3">CNY</TabsTrigger>
                <TabsTrigger value="USD" className="text-xs px-3">USD</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `${currency === 'CNY' ? '¥' : '$'}${(Number(value) || 0).toFixed(2)}`
                  }
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Expense Detail Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">费用明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">分类</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">月度费用</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">占比</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">服务数量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoryData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                categoryData.map((item) => {
                  const total = categoryData.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  const serviceCount = services.filter(
                    (s) =>
                      categories.find((c) => c.id === s.categoryId)?.name === item.name
                  ).length;

                  return (
                    <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-gray-900">
                          {currency === 'CNY' ? '¥' : '$'}
                          {(Number(item.value) || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">{(Number(percentage) || 0).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary">{serviceCount}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
