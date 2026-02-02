import { Package, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ExpiringList } from '@/components/dashboard/ExpiringList';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { ExpenseTrend } from '@/components/dashboard/ExpenseTrend';
import { useAppStore } from '@/store';
import { toast } from 'sonner';

export function Dashboard() {
  const {
    getDashboardStats,
    getExpiringServices,
    getCategoryDistribution,
    getExpenseTrend,
  } = useAppStore();

  const stats = getDashboardStats();
  const expiringServices = getExpiringServices(7);
  const categoryData = getCategoryDistribution();
  const expenseTrend = getExpenseTrend(6);

  const handleRenew = () => {
    toast.success('续费成功', {
      description: '服务到期日期已更新',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="总服务数"
          value={stats.totalServices}
          icon={Package}
          color="#6366F1"
          delay={0}
        />
        <StatCard
          title="本月到期"
          value={stats.expiringThisMonth}
          icon={AlertTriangle}
          color="#EC4899"
          delay={0.1}
        />
        <StatCard
          title="本月费用"
          value={`¥${stats.monthlyExpense.CNY.toFixed(0)}`}
          unit={stats.monthlyExpense.USD > 0 ? `+$${stats.monthlyExpense.USD.toFixed(0)}` : ''}
          icon={DollarSign}
          color="#10B981"
          delay={0.2}
        />
        <StatCard
          title="活跃服务"
          value={stats.activeServices}
          icon={Activity}
          color="#8B5CF6"
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Expiring List - Takes 3 columns */}
        <div className="lg:col-span-3">
          <ExpiringList services={expiringServices} onRenew={handleRenew} />
        </div>

        {/* Charts - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-5">
          <CategoryChart data={categoryData} />
          <ExpenseTrend data={expenseTrend} />
        </div>
      </div>
    </div>
  );
}
