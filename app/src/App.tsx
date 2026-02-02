import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Services } from '@/pages/Services';
import { Calendar } from '@/pages/Calendar';
import { Statistics } from '@/pages/Statistics';
import { Categories } from '@/pages/Categories';
import { Settings } from '@/pages/Settings';
import { useAppStore } from '@/store';
import { useApi, getToken, setToken } from '@/lib/api';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/': '仪表盘',
  '/services': '服务列表',
  '/calendar': '日历视图',
  '/statistics': '费用统计',
  '/categories': '分类管理',
  '/settings': '系统设置',
};

function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const { isAuthenticated, setUser, setAuth, loadFromApi } = useAppStore();
  const [authChecked, setAuthChecked] = useState(!useApi());

  // 当使用 API 时，页面加载后校验 token 并拉取数据
  useEffect(() => {
    if (!useApi() || authChecked) return;
    const token = getToken();
    if (!token) {
      setAuthChecked(true);
      return;
    }
    api.auth
      .me()
      .then((me) => {
        setUser({ id: String(me.id), username: me.username, avatar: undefined });
        setAuth(true);
        return loadFromApi();
      })
      .catch(() => setToken(null))
      .finally(() => setAuthChecked(true));
  }, [authChecked, loadFromApi, setAuth, setUser]);

  // Handle navigation
  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger search - this would open the search dialog in TopBar
        const searchButton = document.querySelector('[data-search-trigger]') as HTMLButtonElement;
        searchButton?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check for expiring services and show toast
  useEffect(() => {
    if (isAuthenticated) {
      const { getExpiringServices } = useAppStore.getState();
      const expiringServices = getExpiringServices(7);

      if (expiringServices.length > 0) {
        const criticalServices = expiringServices.filter((s) => {
          const daysLeft = Math.ceil(
            (new Date(s.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysLeft <= 3;
        });

        if (criticalServices.length > 0) {
          toast.warning(`有 ${criticalServices.length} 个服务即将到期`, {
            description: '请尽快处理续费事宜',
            duration: 5000,
          });
        }
      }
    }
  }, [isAuthenticated]);

  // Render current page content
  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard />;
      case '/services':
        return <Services />;
      case '/calendar':
        return <Calendar />;
      case '/statistics':
        return <Statistics />;
      case '/categories':
        return <Categories />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Handle login success
  const handleLogin = () => {
    navigate('/');
  };

  // If not authenticated, show login page (or loading when validating token)
  if (!isAuthenticated) {
    if (useApi() && getToken() && !authChecked) {
      return (
        <>
          <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
            <div className="w-8 h-8 border-2 border-[#4382FF] border-t-transparent rounded-full animate-spin" />
          </div>
          <Toaster position="top-right" richColors />
        </>
      );
    }
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      <MainLayout
        currentPath={currentPath}
        onNavigate={navigate}
        title={pageTitles[currentPath] || 'SubTracker'}
        onAddService={
          currentPath === '/services'
            ? () => toast.info('添加服务功能开发中')
            : undefined
        }
      >
        {renderPage()}
      </MainLayout>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
