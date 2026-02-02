import { useState } from 'react';
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
import type { BillingCycle, Currency } from '@/types';
import { toast } from 'sonner';

function nextMonthDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddServiceDialog({ open, onOpenChange }: AddServiceDialogProps) {
  const { categories, addService } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    categoryId: categories[0]?.id ?? '',
    provider: '',
    cost: '',
    currency: 'CNY' as Currency,
    billingCycle: 'monthly' as BillingCycle,
    startDate: todayDate(),
    expiryDate: nextMonthDate(),
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await addService({
        name: form.name.trim(),
        categoryId: form.categoryId || (categories[0]?.id ?? ''),
        provider: form.provider.trim() || '—',
        cost,
        currency: form.currency,
        billingCycle: form.billingCycle,
        startDate: form.startDate || todayDate(),
        expiryDate: form.expiryDate,
        notes: form.notes.trim() || undefined,
      });
      toast.success('服务已添加');
      onOpenChange(false);
      setForm({
        name: '',
        categoryId: categories[0]?.id ?? '',
        provider: '',
        cost: '',
        currency: 'CNY',
        billingCycle: 'monthly',
        startDate: todayDate(),
        expiryDate: nextMonthDate(),
        notes: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '添加失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>添加服务</DialogTitle>
          <DialogDescription>填写订阅服务信息，到期前将收到提醒。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">服务名称 *</Label>
            <Input
              id="name"
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
            <Label htmlFor="provider">服务商</Label>
            <Input
              id="provider"
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              placeholder="如：Netflix Inc."
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">费用 *</Label>
              <Input
                id="cost"
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
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">到期日期 *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                className="rounded-xl"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
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
              {isSubmitting ? '添加中…' : '添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
