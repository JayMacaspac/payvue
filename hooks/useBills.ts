'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bill } from '@/app/page';

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bills from database
  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setBills([]);
        return;
      }

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Transform database format to app format
      const transformedBills: Bill[] = (data || []).map(bill => ({
        id: bill.id,
        name: bill.name,
        amount: Number(bill.amount),
        category: bill.category,
        dueDate: bill.due_date,
        isPaid: bill.is_paid,
        isRecurring: bill.is_recurring,
        frequency: bill.frequency as 'monthly' | 'yearly' | 'quarterly',
        description: bill.description || undefined,
      }));

      setBills(transformedBills);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new bill
  const addBill = async (billData: Omit<Bill, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bills')
        .insert({
          user_id: user.id,
          name: billData.name,
          amount: billData.amount,
          category: billData.category,
          due_date: billData.dueDate,
          is_paid: billData.isPaid,
          is_recurring: billData.isRecurring,
          frequency: billData.frequency,
          description: billData.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newBill: Bill = {
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        category: data.category,
        dueDate: data.due_date,
        isPaid: data.is_paid,
        isRecurring: data.is_recurring,
        frequency: data.frequency as 'monthly' | 'yearly' | 'quarterly',
        description: data.description || undefined,
      };

      setBills(prev => [...prev, newBill]);
      return newBill;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Update bill
  const updateBill = async (id: string, billData: Omit<Bill, 'id'>) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          name: billData.name,
          amount: billData.amount,
          category: billData.category,
          due_date: billData.dueDate,
          is_paid: billData.isPaid,
          is_recurring: billData.isRecurring,
          frequency: billData.frequency,
          description: billData.description || null,
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setBills(prev => prev.map(bill => 
        bill.id === id ? { ...billData, id } : bill
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Delete bill
  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setBills(prev => prev.filter(bill => bill.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Toggle paid status
  const togglePaidStatus = async (id: string) => {
    try {
      const bill = bills.find(b => b.id === id);
      if (!bill) return;

      const { error } = await supabase
        .from('bills')
        .update({ is_paid: !bill.isPaid })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setBills(prev => prev.map(bill => 
        bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchBills();

    // Set up real-time subscription
    const channel = supabase
      .channel('bills_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bills' 
        }, 
        () => {
          fetchBills(); // Refetch when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    bills,
    loading,
    error,
    addBill,
    updateBill,
    deleteBill,
    togglePaidStatus,
    refetch: fetchBills,
  };
}