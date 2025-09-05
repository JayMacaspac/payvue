'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bill } from '@/app/page';
import { Plus, Save, X } from 'lucide-react';

import { useCustomCategories } from '@/hooks/useCustomCategories';
interface BillFormProps {
  onSubmit: (billData: Omit<Bill, 'id'>) => void;
  initialData?: Bill | null;
  onCancel?: () => void;
}

export default function BillForm({ onSubmit, initialData, onCancel }: BillFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    amount: initialData?.amount || '',
    category: initialData?.category || 'other',
    dueDate: initialData?.dueDate || '',
    isPaid: initialData?.isPaid || false,
    isRecurring: initialData?.isRecurring || true,
    frequency: initialData?.frequency || 'monthly' as 'monthly' | 'yearly' | 'quarterly',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { getAllCategories } = useCustomCategories();

  const categories = getAllCategories();

  const frequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bill name is required';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const billData: Omit<Bill, 'id'> = {
      name: formData.name.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      dueDate: formData.dueDate,
      isPaid: formData.isPaid,
      isRecurring: formData.isRecurring,
      frequency: formData.frequency,
      description: formData.description.trim(),
    };

    onSubmit(billData);
    
    // Reset form if not editing
    if (!initialData) {
      setFormData({
        name: '',
        amount: '',
        category: 'utilities',
        dueDate: '',
        isPaid: false,
        isRecurring: true,
        frequency: 'monthly',
        description: '',
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {initialData ? (
            <>
              <Save className="h-5 w-5" />
              Edit Bill
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Add New Bill
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bill Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Netflix, Electric Bill"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Recurring Bill */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="space-y-1">
                <Label>Recurring Bill</Label>
                <p className="text-sm text-muted-foreground">
                  This bill repeats automatically
                </p>
              </div>
              <Switch
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleChange('isRecurring', checked)}
              />
            </div>

            {/* Frequency (only show if recurring) */}
            {formData.isRecurring && (
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => handleChange('frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map(frequency => (
                      <SelectItem key={frequency.value} value={frequency.value}>
                        {frequency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="space-y-1">
              <Label>Payment Status</Label>
              <p className="text-sm text-muted-foreground">
                Mark as already paid
              </p>
            </div>
            <Switch
              checked={formData.isPaid}
              onCheckedChange={(checked) => handleChange('isPaid', checked)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional notes about this bill..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {initialData ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Bill
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bill
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}