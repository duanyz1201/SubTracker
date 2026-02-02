import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { services, categories } = useAppStore();

  // Get calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startDay = getDay(start);

    // Adjust for Monday start (0 = Sunday, so we need to shift)
    const days = eachDayOfInterval({ start, end });
    const paddingDays = startDay === 0 ? 6 : startDay - 1;

    return { days, paddingDays };
  }, [currentDate]);

  // Get services for a specific date
  const getServicesForDate = (date: Date) => {
    return services.filter((service) => {
      const expiryDate = new Date(service.expiryDate);
      return isSameDay(expiryDate, date);
    });
  };

  // Get services for selected date
  const selectedDateServices = selectedDate ? getServicesForDate(selectedDate) : [];

  // Get month summary
  const monthServices = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    return services
      .filter((service) => {
        const expiryDate = new Date(service.expiryDate);
        return expiryDate >= start && expiryDate <= end;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [services, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'yyyy年 M月', { locale: zhCN })}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              今天
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                周{day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding days */}
            {Array.from({ length: calendarDays.paddingDays }).map((_, i) => (
              <div key={`padding-${i}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {calendarDays.days.map((day) => {
              const dayServices = getServicesForDate(day);
              const hasServices = dayServices.length > 0;
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <motion.button
                  key={day.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'aspect-square p-2 rounded-lg border transition-all relative',
                    isSelected
                      ? 'border-[#4382FF] bg-[#4382FF]/5'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50',
                    isToday && 'bg-[#4382FF]/10'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isToday ? 'text-[#4382FF]' : 'text-gray-700',
                      !isSameMonth(day, currentDate) && 'text-gray-300'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Service dots */}
                  {hasServices && (
                    <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5 flex-wrap">
                      {dayServices.slice(0, 3).map((service, i) => {
                        const category = categories.find((c) => c.id === service.categoryId);
                        return (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: category?.color || '#4382FF' }}
                          />
                        );
                      })}
                      {dayServices.length > 3 && (
                        <span className="text-[8px] text-gray-400">+</span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Month Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-[#4382FF]" />
              <h3 className="text-lg font-semibold text-gray-900">本月到期</h3>
            </div>

            {monthServices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                本月没有到期的服务
              </div>
            ) : (
              <div className="space-y-3">
                {monthServices.map((service) => {
                  const category = categories.find((c) => c.id === service.categoryId);
                  const daysLeft = Math.ceil(
                    (new Date(service.expiryDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedDate(new Date(service.expiryDate))}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{service.name}</span>
                          {category && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{service.expiryDate}</div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          daysLeft <= 3 && 'bg-red-100 text-red-700',
                          daysLeft > 3 && daysLeft <= 7 && 'bg-yellow-100 text-yellow-700',
                          daysLeft > 7 && 'bg-green-100 text-green-700'
                        )}
                      >
                        {daysLeft <= 0 ? '今天' : `${daysLeft}天后`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">分类图例</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'yyyy年M月d日', { locale: zhCN })}到期服务
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedDateServices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                该日期没有到期的服务
              </div>
            ) : (
              selectedDateServices.map((service) => {
                const category = categories.find((c) => c.id === service.categoryId);
                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{service.name}</span>
                        {category && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{service.provider}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {service.currency === 'CNY' ? '¥' : '$'}
                        {service.cost}
                      </div>
                      <div className="text-xs text-gray-500">
                        {service.billingCycle === 'monthly' && '月付'}
                        {service.billingCycle === 'quarterly' && '季付'}
                        {service.billingCycle === 'yearly' && '年付'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
