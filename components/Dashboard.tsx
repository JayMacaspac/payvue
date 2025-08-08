'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/app/page';
import { DollarSign, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  bills: Bill[];
}

export default function Dashboard({ bills }: DashboardProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Calculate metrics
  const totalMonthlyBills = bills
    .filter(bill => bill.frequency === 'monthly')
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  const unpaidBills = bills.filter(bill => !bill.isPaid);
  const unpaidAmount = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
  
  const upcomingBills = bills
    .filter(bill => {
      const dueDate = new Date(bill.dueDate);
      const daysDiff = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
      return daysDiff >= 0 && daysDiff <= 7 && !bill.isPaid;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const categoryTotals = bills.reduce((acc, bill) => {
    acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      utilities: 'bg-blue-100 text-blue-800',
      streaming: 'bg-purple-100 text-purple-800',
      insurance: 'bg-green-100 text-green-800',
      subscriptions: 'bg-orange-100 text-orange-800',
      rent: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Monthly Total</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyBills)}</div>
            <p className="text-xs opacity-90 mt-1">
              Across {bills.filter(b => b.frequency === 'monthly').length} bills
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Unpaid Bills</CardTitle>
            <AlertTriangle className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(unpaidAmount)}</div>
            <p className="text-xs opacity-90 mt-1">
              {unpaidBills.length} bills pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Due This Week</CardTitle>
            <Calendar className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBills.length}</div>
            <p className="text-xs opacity-90 mt-1">
              {formatCurrency(upcomingBills.reduce((sum, bill) => sum + bill.amount, 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categoryTotals).length}</div>
            <p className="text-xs opacity-90 mt-1">
              Active categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Bills (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBills.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming bills in the next 7 days
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((bill) => {
                  const dueDate = new Date(bill.dueDate);
                  const daysDiff = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
                  
                  return (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{bill.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {daysDiff === 0 ? 'Due Today' : `Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(bill.amount)}</p>
                        <Badge variant="outline" className={getCategoryColor(bill.category)}>
                          {bill.category}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => {
                  const percentage = ((amount / totalMonthlyBills) * 100).toFixed(1);
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(category)}>
                            {category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(amount)}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}