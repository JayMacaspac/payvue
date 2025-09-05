'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch custom categories from database
  const fetchCustomCategories = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCustomCategories([]);
        return;
      }

      const { data, error } = await supabase
        .from('custom_categories')
        .select('name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;

      const categories = (data || []).map(item => item.name);
      setCustomCategories(categories);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching custom categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new custom category
  const addCategory = async (category: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const normalizedCategory = category.trim().toLowerCase();

      const { error } = await supabase
        .from('custom_categories')
        .insert({
          user_id: user.id,
          name: normalizedCategory,
        });

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          throw new Error('This category already exists');
        }
        throw error;
      }

      // Add to local state
      setCustomCategories(prev => [...prev, normalizedCategory].sort());
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Remove custom category
  const removeCategory = async (category: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('user_id', user.id)
        .eq('name', category);

      if (error) throw error;

      // Remove from local state
      setCustomCategories(prev => prev.filter(cat => cat !== category));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Get all categories (default + custom)
  const getAllCategories = () => {
    const defaultCategories = [
      { value: 'utilities', label: 'Utilities' },
      { value: 'subscriptions', label: 'Subscriptions' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'rent', label: 'Rent/Mortgage' },
    ];

    const customCategoryOptions = customCategories.map(category => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
    }));

    return [...defaultCategories, ...customCategoryOptions];
  };

  useEffect(() => {
    fetchCustomCategories();

    // Set up real-time subscription
    const channel = supabase
      .channel('custom_categories_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'custom_categories' 
        }, 
        () => {
          fetchCustomCategories(); // Refetch when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    customCategories,
    loading,
    error,
    addCategory,
    removeCategory,
    getAllCategories,
    refetch: fetchCustomCategories,
  };
}