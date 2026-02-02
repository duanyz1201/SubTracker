import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import type { Service } from '@/types';

interface ExpiringListProps {
  services: Service[];
  onRenew?: () => void;
}

export function ExpiringList({ services, onRenew }: ExpiringListProps) {
  const { categories, renewService } = useAppStore();

  const handleRenew = async (id: string) => {
    try {
      await renewService(id);
      onRenew?.();
    } catch {
      // error toast can be shown by parent if needed
    }
  };

  const getDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'bg-gradient-to-r from-rose-500 to-red-600 text-white';
    if (daysLeft <= 3) return 'bg-gradient-to-r from-orange-500 to-amber-600 text-white';
    if (daysLeft <= 7) return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
    return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white';
  };

  const getStatusText = (daysLeft: number) => {
    if (daysLeft <= 1) return '今天到期';
    if (daysLeft <= 3) return `${daysLeft}天后到期`;
    if (daysLeft <= 7) return `${daysLeft}天后到期`;
    return `${daysLeft}天后到期`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">即将到期</h3>
          </div>
          <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">未来7天内</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {services.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400">未来7天内没有到期的服务</p>
          </div>
        ) : (
          services.map((service, index) => {
            const category = categories.find((c) => c.id === service.categoryId);
            const daysLeft = getDaysLeft(service.expiryDate);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className="font-medium text-slate-800 truncate">{service.name}</h4>
                      {category && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                          style={{
                            backgroundColor: `${category.color}15`,
                            color: category.color,
                            borderColor: `${category.color}30`,
                          }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span>{service.provider}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{service.expiryDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium shadow-sm',
                        getStatusColor(daysLeft)
                      )}
                    >
                      {getStatusText(daysLeft)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRenew(service.id)}
                      className="rounded-xl border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      续费
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
