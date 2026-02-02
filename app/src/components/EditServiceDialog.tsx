import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store';
import type { Service, BillingCycle, Currency } from '@/types';
import { toast } from 'sonner';

interface EditServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}

export function EditServiceDialog({ open, onOpenChange, service }: EditServiceDialogProps) {
  const { categories, updateService } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    provider: '',
    cost: '',
    currency: 'CNY' as Currency,
    billingCycle: 'monthly' as BillingCycle,
    startDate: '',
    expiryDate: '',
    notes: '',
  });

  // 打开弹窗时用当前服务数据填充表单
  useEffect(() => {
    if (open && service) {
      setForm({
        name: service.name,
        categoryId: service.categoryId || (categories[0]?.id ?? ''),
        provider: service.provider || '',
        cost: String(service.cost),
        currency: service.currency,
        billingCycle: service.billingCycle,
        startDate: service.startDate || '',
        expiryDate: service.expiryDate,
        notes: service.notes || '',
      });
    }
  }, [open, service, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    if (!form.name.trim()) {
      toast.error('请输入服务名称');
      return;
    }
    const cost = parseFloat(form.cost);
    if (isNaN(cost) || cost < 0) {
      toast.error('请输入有效费用');
      return;
    }
    if (!form.expiryDate) {
      toast.error('请选择到期日期');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateService(service.id, {
        name: form.name.trim(),
        categoryId: form.categoryId || undefined,
        provider: form.provider.trim() || '—',
        cost,
        currency: form.currency,
        billingCycle: form.billingCycle,
        startDate: form.startDate || undefined,
        expiryDate: form.expiryDate,
        notes: form.notes.trim() || undefined,
      });
      toast.success('服务已更新');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>编辑服务</DialogTitle>
          <DialogDescription>修改订阅服务信息。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">服务名称 *</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="如：Netflix、iCloud"
              className="rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>分类</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-provider">服务商</Label>
            <Input
              id="edit-provider"
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              placeholder="如：Netflix Inc."
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cost">费用 *</Label>
              <Input
                id="edit-cost"
                type="number"
                min={0}
                step={0.01}
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>货币</Label>
              <Select
                value={form.currency}
                onValueChange={(v) => setForm((f) => ({ ...f, currency: v as Currency }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNY">CNY</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>计费周期</Label>
            <Select
              value={form.billingCycle}
              onValueChange={(v) => setForm((f) => ({ ...f, billingCycle: v as BillingCycle }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">月付</SelectItem>
                <SelectItem value="quarterly">季付</SelectItem>
                <SelectItem value="yearly">年付</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">开始日期</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate">到期日期 *</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                className="rounded-xl"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">备注</Label>
            <Textarea
              id="edit-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="可选"
              className="rounded-xl min-h-[80px]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              取消
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中…' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
