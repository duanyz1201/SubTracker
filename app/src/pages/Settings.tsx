import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Lock, Save, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppStore } from '@/store';
import { toast } from 'sonner';

export function Settings() {
  const { settings, updateSettings } = useAppStore();
  const [telegramForm, setTelegramForm] = useState({
    botToken: settings.telegramBotToken || '',
    chatId: settings.telegramChatId || '',
  });
  const [reminderForm, setReminderForm] = useState({
    reminderTime: settings.reminderTime,
    reminderDays: settings.reminderDays,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveTelegram = async () => {
    try {
      await updateSettings({
        telegramBotToken: telegramForm.botToken,
        telegramChatId: telegramForm.chatId,
      });
      toast.success('Telegram 配置已保存');
    } catch (e) {
      toast.error('保存失败', { description: e instanceof Error ? e.message : '请重试' });
    }
  };

  const handleTestTelegram = async () => {
    try {
      const { api } = await import('@/lib/api');
      await api.settings.testTelegram();
      toast.success('测试消息已发送', {
        description: '请检查您的 Telegram 消息',
      });
    } catch (e) {
      toast.error('测试失败', { description: e instanceof Error ? e.message : '请检查 Bot Token 和 Chat ID' });
    }
  };

  const handleSaveReminder = async () => {
    try {
      await updateSettings({
        reminderTime: reminderForm.reminderTime,
        reminderDays: reminderForm.reminderDays,
      });
      toast.success('提醒设置已保存');
    } catch (e) {
      toast.error('保存失败', { description: e instanceof Error ? e.message : '请重试' });
    }
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }
    try {
      const { api, useApi } = await import('@/lib/api');
      if (useApi()) {
        await api.auth.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      }
      toast.success('密码已修改');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (e) {
      toast.error('修改失败', { description: e instanceof Error ? e.message : '请检查原密码' });
    }
  };

  const toggleReminderDay = (day: number) => {
    const newDays = reminderForm.reminderDays.includes(day)
      ? reminderForm.reminderDays.filter((d) => d !== day)
      : [...reminderForm.reminderDays, day].sort((a, b) => b - a);
    setReminderForm({ ...reminderForm, reminderDays: newDays });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Telegram Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#4382FF]" />
              <CardTitle>Telegram 配置</CardTitle>
            </div>
            <CardDescription>
              配置 Telegram Bot 以接收到期提醒通知
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="botToken">Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                value={telegramForm.botToken}
                onChange={(e) => setTelegramForm({ ...telegramForm, botToken: e.target.value })}
                placeholder="输入您的 Bot Token"
              />
              <p className="text-xs text-gray-500">
                从 @BotFather 获取您的 Bot Token
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chatId">Chat ID</Label>
              <Input
                id="chatId"
                value={telegramForm.chatId}
                onChange={(e) => setTelegramForm({ ...telegramForm, chatId: e.target.value })}
                placeholder="输入您的 Chat ID"
              />
              <p className="text-xs text-gray-500">
                向您的 Bot 发送消息，然后访问 https://api.telegram.org/bot&lt;token&gt;/getUpdates 获取 Chat ID
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveTelegram} className="bg-[#4382FF] hover:bg-[#357ABD]">
                <Save className="w-4 h-4 mr-2" />
                保存配置
              </Button>
              <Button variant="outline" onClick={handleTestTelegram}>
                <TestTube className="w-4 h-4 mr-2" />
                测试连接
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reminder Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#4382FF]" />
              <CardTitle>提醒设置</CardTitle>
            </div>
            <CardDescription>
              设置订阅到期提醒的时间和频率
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminderTime">每日提醒时间</Label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderForm.reminderTime}
                onChange={(e) => setReminderForm({ ...reminderForm, reminderTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>提醒节点（到期前）</Label>
              <div className="flex flex-wrap gap-2">
                {[1, 3, 7, 14, 30].map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleReminderDay(day)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      reminderForm.reminderDays.includes(day)
                        ? 'bg-[#4382FF] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day} 天
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleSaveReminder} className="bg-[#4382FF] hover:bg-[#357ABD]">
                <Save className="w-4 h-4 mr-2" />
                保存设置
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#4382FF]" />
              <CardTitle>账户设置</CardTitle>
            </div>
            <CardDescription>
              修改您的登录密码
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="输入当前密码"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="输入新密码"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="再次输入新密码"
              />
            </div>

            <div className="pt-2">
              <Button onClick={handleSavePassword} className="bg-[#4382FF] hover:bg-[#357ABD]">
                <Save className="w-4 h-4 mr-2" />
                修改密码
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
