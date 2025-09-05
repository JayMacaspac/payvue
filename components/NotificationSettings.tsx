'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationSettingsProps {
  onSettingsChange: (settings: NotificationSettings) => void;
  settings: NotificationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  daysBeforeDue: number;
  showBrowserNotifications: boolean;
  showDashboardAlerts: boolean;
}

export default function NotificationSettings({ onSettingsChange, settings }: NotificationSettingsProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Test notification
        new Notification('Bill Tracker', {
          body: 'Notifications are now enabled for bill reminders!',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bell className="h-5 w-5" />
          Bill Reminders & Notifications
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              Enable Bill Reminders
            </Label>
            <p className="text-xs text-muted-foreground">
              Get notified when bills are due soon
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Days Before Due */}
            <div className="space-y-2">
              <Label>Remind me this many days before due date:</Label>
              <Select 
                value={settings.daysBeforeDue.toString()} 
                onValueChange={(value) => handleSettingChange('daysBeforeDue', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="2">2 days before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="5">5 days before</SelectItem>
                  <SelectItem value="7">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dashboard Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Dashboard Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show alert banners on the dashboard
                </p>
              </div>
              <Switch
                checked={settings.showDashboardAlerts}
                onCheckedChange={(checked) => handleSettingChange('showDashboardAlerts', checked)}
              />
            </div>

            {/* Browser Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get desktop notifications even when app is closed
                  </p>
                </div>
                <Switch
                  checked={settings.showBrowserNotifications && notificationPermission === 'granted'}
                  onCheckedChange={(checked) => {
                    if (checked && notificationPermission !== 'granted') {
                      requestNotificationPermission();
                    } else {
                      handleSettingChange('showBrowserNotifications', checked);
                    }
                  }}
                  disabled={notificationPermission === 'denied'}
                />
              </div>

              {/* Permission Status */}
              <div className="flex items-center gap-2 text-sm">
                {notificationPermission === 'granted' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">Browser notifications enabled</span>
                  </>
                ) : notificationPermission === 'denied' ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">Browser notifications blocked</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-700">Permission not granted</span>
                  </>
                )}
              </div>

              {notificationPermission === 'default' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="w-full"
                >
                  Enable Browser Notifications
                </Button>
              )}

              {notificationPermission === 'denied' && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-800 text-xs">
                    Browser notifications are blocked. Enable them in your browser settings to receive desktop alerts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {/* Benefits */}
        {settings.enabled && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Active Reminders</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Dashboard alerts for upcoming bills</li>
              {settings.showBrowserNotifications && notificationPermission === 'granted' && (
                <li>• Desktop notifications {settings.daysBeforeDue} days before due date</li>
              )}
              <li>• Visual indicators on bill cards</li>
              <li>• Overdue bill highlighting</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { NotificationSettings }