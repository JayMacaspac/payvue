'use client';

import { useState, useEffect } from 'react';
import { Bill } from '@/app/page';

export interface NotificationSettings {
  enabled: boolean;
  daysBeforeDue: number;
  showBrowserNotifications: boolean;
  showDashboardAlerts: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  daysBeforeDue: 3,
  showBrowserNotifications: true,
  showDashboardAlerts: true,
};

export function useNotifications(bills: Bill[]) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
  const [overdueBills, setOverdueBills] = useState<Bill[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('billTracker_notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('billTracker_notificationSettings', JSON.stringify(newSettings));
  };

  // Calculate upcoming and overdue bills
  useEffect(() => {
    if (!settings.enabled) {
      setUpcomingBills([]);
      setOverdueBills([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: Bill[] = [];
    const overdue: Bill[] = [];

    bills.forEach(bill => {
      if (bill.isPaid) return; // Skip paid bills

      const dueDate = new Date(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 0) {
        overdue.push(bill);
      } else if (daysDiff <= settings.daysBeforeDue) {
        upcoming.push(bill);
      }
    });

    setUpcomingBills(upcoming);
    setOverdueBills(overdue);
  }, [bills, settings]);

  // Send browser notifications
  useEffect(() => {
    if (!settings.enabled || !settings.showBrowserNotifications) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // Notify about bills due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const billsDueToday = bills.filter(bill => {
      if (bill.isPaid) return false;
      const dueDate = new Date(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    billsDueToday.forEach(bill => {
      // Check if we've already notified about this bill today
      const notificationKey = `notified_${bill.id}_${today.toDateString()}`;
      if (localStorage.getItem(notificationKey)) return;

      new Notification(`Bill Due Today: ${bill.name}`, {
        body: `$${bill.amount.toFixed(2)} is due today`,
        icon: '/favicon.ico',
        tag: bill.id, // Prevent duplicate notifications
      });

      // Mark as notified
      localStorage.setItem(notificationKey, 'true');
    });
  }, [bills, settings]);

  // Get bills that need attention (upcoming + overdue)
  const getBillsNeedingAttention = () => {
    return [...overdueBills, ...upcomingBills].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  };

  // Get notification summary
  const getNotificationSummary = () => {
    const total = upcomingBills.length + overdueBills.length;
    if (total === 0) return null;

    return {
      total,
      upcoming: upcomingBills.length,
      overdue: overdueBills.length,
      totalAmount: [...upcomingBills, ...overdueBills].reduce((sum, bill) => sum + bill.amount, 0),
    };
  };

  return {
    settings,
    updateSettings,
    upcomingBills,
    overdueBills,
    getBillsNeedingAttention,
    getNotificationSummary,
  };
}