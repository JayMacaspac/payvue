'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/app/page';
import { Check, X, Edit, Trash2, Calendar, DollarSign, RotateCcw } from 'lucide-react';

interface BillCardProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export default function BillCard({ bill, onTogglePaid, onEdit, onDelete }: BillCardProps) {
  // TODO: add currency support based on user preference
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      utilities: 'bg-blue-100 text-blue-800 border-blue-200',
      streaming: 'bg-purple-100 text-purple-800 border-purple-200',
      insurance: 'bg-green-100 text-green-800 border-green-200',
      subscriptions: 'bg-orange-100 text-orange-800 border-orange-200',
      rent: 'bg-red-100 text-red-800 border-red-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getDueDateColor = () => {
    if (bill.isPaid) return 'text-green-600';
    
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 3) return 'text-orange-600';
    return 'text-slate-600';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      bill.isPaid 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
        : 'bg-white hover:bg-slate-50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{bill.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {bill.description || 'No description'}
            </p>
          </div>
          <Badge className={getCategoryColor(bill.category)}>
            {bill.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Amount and Due Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold">{formatCurrency(bill.amount)}</span>
            {bill.isRecurring && (
              <Badge variant="outline" className="text-xs">
                <RotateCcw className="h-3 w-3 mr-1" />
                {bill.frequency}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(bill.dueDate)}</span>
            <span className={`text-xs font-medium ${getDueDateColor()}`}>
              ({getDaysUntilDue()})
            </span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            bill.isPaid 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {bill.isPaid ? (
              <>
                <Check className="h-4 w-4" />
                Paid
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Unpaid
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant={bill.isPaid ? "outline" : "default"}
            size="sm"
            onClick={() => onTogglePaid(bill.id)}
            className="flex-1"
          >
            {bill.isPaid ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Mark Unpaid
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Mark Paid
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(bill)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(bill.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}