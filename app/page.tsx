'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBills } from '@/hooks/useBills';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import BillList from '@/components/BillList';
import BillForm from '@/components/BillForm';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, BarChart3, LogOut, User } from 'lucide-react';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string;
  isPaid: boolean;
  isRecurring: boolean;
  frequency: 'monthly' | 'yearly' | 'quarterly';
  description?: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bills' | 'add'>('dashboard');
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  
  const { 
    bills, 
    loading: billsLoading, 
    error: billsError,
    addBill: addBillToDb, 
    updateBill: updateBillInDb, 
    deleteBill: deleteBillFromDb, 
    togglePaidStatus 
  } = useBills();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveTab('dashboard');
    setEditingBill(null);
  };

  const addBill = async (billData: Omit<Bill, 'id'>) => {
    try {
      await addBillToDb(billData);
      setActiveTab('bills');
    } catch (error) {
      console.error('Error adding bill:', error);
    }
  };

  const updateBill = async (id: string, billData: Omit<Bill, 'id'>) => {
    try {
      await updateBillInDb(id, billData);
      setEditingBill(null);
      setActiveTab('bills');
    } catch (error) {
      console.error('Error updating bill:', error);
    }
  };

  const deleteBill = async (id: string) => {
    try {
      await deleteBillFromDb(id);
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingBill(null);
    setActiveTab('bills');
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm onAuthSuccess={() => setUser(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Bill Tracker</h1>
            <p className="text-slate-600">Manage your bills and subscriptions in one place</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4" />
              {user.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'bills' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('bills')}
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Bills
            </Button>
            <Button
              variant={activeTab === 'add' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('add')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {editingBill ? 'Edit Bill' : 'Add Bill'}
            </Button>
          </nav>
        </div>

        {/* Content */}
        {billsLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your bills...</p>
          </div>
        ) : billsError ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading bills: {billsError}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'dashboard' && <Dashboard bills={bills} />}
            
            {activeTab === 'bills' && (
              <BillList
                bills={bills}
                onTogglePaid={togglePaidStatus}
                onEdit={handleEdit}
                onDelete={deleteBill}
              />
            )}
            
            {activeTab === 'add' && (
              <BillForm
                onSubmit={editingBill ? 
                  (billData) => updateBill(editingBill.id, billData) : 
                  addBill
                }
                initialData={editingBill}
                onCancel={editingBill ? handleCancelEdit : undefined}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}