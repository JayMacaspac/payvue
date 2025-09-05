'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/app/page';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { useState } from 'react';

interface NotificationBannerProps {
  upcomingBills: Bill[];
  overdueBills: Bill[];
  onDismiss?: () => void;
}

export default function NotificationBanner({ upcomingBills, overdueBills, onDismiss }: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (upcomingBills.length === 0 && overdueBills.length === 0)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalAmount = [...upcomingBills, ...overdueBills].reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-2">
      {/* Overdue Bills Alert */}
      {overdueBills.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium text-red-800">
                {overdueBills.length} overdue bill{overdueBills.length > 1 ? 's' : ''} 
              </span>
              <span className="text-red-700 ml-2">
                ({formatCurrency(overdueBills.reduce((sum, bill) => sum + bill.amount, 0))})
              </span>
              <div className="flex gap-1 mt-1">
                {overdueBills.slice(0, 3).map(bill => (
                  <Badge key={bill.id} variant="destructive" className="text-xs">
                    {bill.name}
                  </Badge>
                ))}
                {overdueBills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{overdueBills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium text-orange-800">
                {upcomingBills.length} bill{upcomingBills.length > 1 ? 's' : ''} due soon
              </span>
              <span className="text-orange-700 ml-2">
                ({formatCurrency(upcomingBills.reduce((sum, bill) => sum + bill.amount, 0))})
              </span>
              <div className="flex gap-1 mt-1">
                {upcomingBills.slice(0, 3).map(bill => {
                  const daysUntilDue = Math.ceil(
                    (new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Badge key={bill.id} variant="outline" className="text-xs border-orange-300">
                      {bill.name} ({daysUntilDue}d)
                    </Badge>
                  );
                })}
                {upcomingBills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{upcomingBills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}