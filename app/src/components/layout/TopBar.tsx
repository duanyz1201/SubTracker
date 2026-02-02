import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Bell, X, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

interface TopBarProps {
  title: string;
  onAddService?: () => void;
  sidebarCollapsed?: boolean;
}

export function TopBar({ title, onAddService }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { services, getExpiringServices } = useAppStore();

  const expiringCount = getExpiringServices(7).length;

  // 搜索服务
  const searchResults = searchQuery
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-600/10 flex items-center justify-center">
          <span className="text-xl font-bold bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            {title.charAt(0)}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </motion.div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl transition-all duration-200 border border-slate-200/50">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">搜索</span>
              <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-white rounded-md border border-slate-200 shadow-sm">
                <Command className="w-3 h-3" />
                <span>K</span>
              </kbd>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>搜索服务</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索服务名称或服务商..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <ul className="space-y-2">
                    {searchResults.map((service) => (
                      <li
                        key={service.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{service.name}</p>
                          <p className="text-sm text-slate-500">{service.provider}</p>
                        </div>
                        <span
                          className={cn(
                            'px-2.5 py-1 text-xs font-medium rounded-full',
                            service.status === 'active' && 'bg-emerald-100 text-emerald-700',
                            service.status === 'expiring' && 'bg-rose-100 text-rose-700',
                            service.status === 'expiring-soon' && 'bg-amber-100 text-amber-700',
                            service.status === 'expired' && 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {service.status === 'active' && '正常'}
                          {service.status === 'expiring' && '即将到期'}
                          {service.status === 'expiring-soon' && '快到期'}
                          {service.status === 'expired' && '已过期'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : searchQuery ? (
                  <div className="text-center py-8 text-slate-500">未找到匹配的服务</div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    输入关键词开始搜索
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications */}
        <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/50">
          <Bell className="w-5 h-5" />
          {expiringCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
              {expiringCount}
            </span>
          )}
        </button>

        {/* Add Service Button */}
        {onAddService && (
          <Button 
            onClick={onAddService} 
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加服务
          </Button>
        )}
      </div>
    </header>
  );
}
