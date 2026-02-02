import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Play,
  Music,
  Briefcase,
  Cloud,
  Code,
  Film,
  BookOpen,
  Gamepad2,
  ShoppingBag,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { toast } from 'sonner';

const iconOptions = [
  { name: 'Play', icon: Play },
  { name: 'Music', icon: Music },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Cloud', icon: Cloud },
  { name: 'Code', icon: Code },
  { name: 'Film', icon: Film },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'ShoppingBag', icon: ShoppingBag },
];

const colorOptions = [
  '#E53935', // Red
  '#1E88E5', // Blue
  '#43A047', // Green
  '#FB8C00', // Orange
  '#8E24AA', // Purple
  '#00ACC1', // Cyan
  '#FDD835', // Yellow
  '#6D4C41', // Brown
  '#546E7A', // Gray
  '#EC407A', // Pink
];

export function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: colorOptions[0],
    icon: iconOptions[0].name,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleOpenDialog = (category?: typeof categories[0]) => {
    if (category) {
      setEditingCategory(category.id);
      setFormData({
        name: category.name,
        color: category.color,
        icon: category.icon,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        color: colorOptions[0],
        icon: iconOptions[0].name,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入分类名称');
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory(editingCategory, formData);
        toast.success('分类已更新');
      } else {
        await addCategory(formData);
        toast.success('分类已创建');
      }
      setIsDialogOpen(false);
    } catch (e) {
      toast.error('保存失败', { description: e instanceof Error ? e.message : '请重试' });
    }
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete);
      toast.success('分类已删除');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (e) {
      toast.error('删除失败', { description: e instanceof Error ? e.message : '请重试' });
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find((i) => i.name === iconName);
    return iconOption?.icon || Play;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-900">分类管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理您的订阅服务分类</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#4382FF] hover:bg-[#357ABD]">
          <Plus className="w-4 h-4 mr-2" />
          添加分类
        </Button>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {categories.map((category, index) => {
          const IconComponent = getIconComponent(category.icon);

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              {/* Color Bar */}
              <div
                className="h-1 w-full rounded-full mb-4"
                style={{ backgroundColor: category.color }}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: category.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.serviceCount} 个服务</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? '编辑分类' : '添加分类'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">分类名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入分类名称"
              />
            </div>

            <div className="space-y-2">
              <Label>图标</Label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.name}
                      onClick={() => setFormData({ ...formData, icon: option.name })}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all',
                        formData.icon === option.name
                          ? 'border-[#4382FF] bg-[#4382FF]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <Icon className="w-5 h-5 mx-auto text-gray-600" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      'w-full aspect-square rounded-lg transition-all',
                      formData.color === color
                        ? 'ring-2 ring-offset-2 ring-gray-400'
                        : 'hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} className="bg-[#4382FF] hover:bg-[#357ABD]">
              {editingCategory ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这个分类吗？该分类下的服务将变为未分类状态。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
