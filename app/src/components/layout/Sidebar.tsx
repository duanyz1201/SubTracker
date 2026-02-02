import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  List,
  Calendar,
  BarChart3,
  FolderOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  group?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, path: '/' },
  { id: 'services', label: '服务列表', icon: List, path: '/services' },
  { id: 'calendar', label: '日历视图', icon: Calendar, path: '/calendar' },
  { id: 'statistics', label: '费用统计', icon: BarChart3, path: '/statistics' },
  { id: 'categories', label: '分类管理', icon: FolderOpen, path: '/categories', group: '管理' },
  { id: 'settings', label: '系统设置', icon: Settings, path: '/settings', group: '管理' },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, getExpiringServices } = useAppStore();

  const expiringCount = getExpiringServices(7).length;

  const handleLogout = () => {
    logout();
    onNavigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -240 }}
      animate={{ x: 0, width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/50">
        <motion.div
          className="flex items-center gap-3"
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg whitespace-nowrap tracking-tight">SubTracker</span>
          )}
        </motion.div>
        {isCollapsed && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {/* Main Menu */}
        <div className="mb-6">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
              主菜单
            </div>
          )}
          <ul className="space-y-1">
            {navItems
              .filter((item) => !item.group)
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.path)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group',
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                      )}
                      {item.id === 'dashboard' && expiringCount > 0 && !isCollapsed && (
                        <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {expiringCount}
                        </span>
                      )}
                      {isCollapsed && item.id === 'dashboard' && expiringCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center">
                          {expiringCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Management */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
              管理
            </div>
          )}
          <ul className="space-y-1">
            {navItems
              .filter((item) => item.group === '管理')
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.path)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-slate-800/50">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username || 'Admin'}</p>
              <p className="text-xs text-slate-400">管理员</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
