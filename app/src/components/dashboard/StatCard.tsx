import { useEffect, useRef } from 'react';
import { motion, useSpring, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  unit = '',
  change,
  changeType = 'increase',
  icon: Icon,
  color,
  delay = 0,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  // 数字动画
  const springValue = useSpring(0, { duration: 1500, bounce: 0 });

  useEffect(() => {
    if (isInView && typeof value === 'number') {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  const getGradientClass = (color: string) => {
    const gradients: Record<string, string> = {
      '#6366F1': 'from-indigo-500 to-violet-600',
      '#EC4899': 'from-pink-500 to-rose-600',
      '#10B981': 'from-emerald-500 to-teal-600',
      '#8B5CF6': 'from-violet-500 to-purple-600',
      '#F59E0B': 'from-amber-500 to-orange-600',
      '#3B82F6': 'from-blue-500 to-indigo-600',
    };
    return gradients[color] || 'from-slate-500 to-slate-600';
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-slate-800">
              {typeof value === 'number' ? Math.round(value * 100) / 100 : value}
            </h3>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}
          </div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm',
                changeType === 'increase' ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{change > 0 ? '+' : ''}{change}%</span>
              <span className="text-slate-400 ml-1">较上月</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
            getGradientClass(color)
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
