import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, Clock } from 'lucide-react';
import { NotificationService } from '@/services/notificationService';
import { Capacitor } from '@capacitor/core';

export function NotificationSettings() {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [isNativePlatform, setIsNativePlatform] = useState(false);

  useEffect(() => {
    setIsNativePlatform(Capacitor.isNativePlatform());
    
    // Load saved settings
    const savedEnabled = localStorage.getItem('notifications-enabled') === 'true';
    const savedTime = localStorage.getItem('reminder-time') || '08:00';
    
    setNotificationsEnabled(savedEnabled);
    setReminderTime(savedTime);

    // Setup notification handlers
    NotificationService.setupNotificationHandlers();
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      // Request permissions
      const hasPermission = await NotificationService.requestPermissions();
      
      if (!hasPermission) {
        toast({
          title: 'Permission Required',
          description: 'Please enable notifications in your device settings to receive weight reminders.',
          variant: 'destructive'
        });
        return;
      }

      // Schedule notifications
      const success = await NotificationService.scheduleWeightReminder(reminderTime);
      
      if (success) {
        setNotificationsEnabled(true);
        localStorage.setItem('notifications-enabled', 'true');
        toast({
          title: 'Notifications Enabled',
          description: `Daily weight reminders set for ${reminderTime}`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to schedule notifications. Please try again.',
          variant: 'destructive'
        });
      }
    } else {
      // Disable notifications
      await NotificationService.clearWeightReminders();
      setNotificationsEnabled(false);
      localStorage.setItem('notifications-enabled', 'false');
      toast({
        title: 'Notifications Disabled',
        description: 'Weight reminders have been turned off.',
      });
    }
  };

  const handleTimeChange = async (newTime: string) => {
    setReminderTime(newTime);
    localStorage.setItem('reminder-time', newTime);

    // If notifications are enabled, reschedule with new time
    if (notificationsEnabled) {
      const success = await NotificationService.scheduleWeightReminder(newTime);
      
      if (success) {
        toast({
          title: 'Time Updated',
          description: `Weight reminders updated to ${newTime}`,
        });
      }
    }
  };

  if (!isNativePlatform) {
    return (
      <Card className="bg-fitness-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-4">
              Notifications are only available on mobile devices. To receive daily weight reminders:
            </p>
            <ol className="text-sm text-muted-foreground text-left space-y-2">
              <li>1. Export this project to GitHub</li>
              <li>2. Run the mobile app using Capacitor</li>
              <li>3. Install it on your phone</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-fitness-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Daily Weight Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="notifications-toggle" className="text-sm font-medium">
              Enable Daily Reminders
            </Label>
            <p className="text-xs text-muted-foreground">
              Get notified to track your weight every day
            </p>
          </div>
          <Switch
            id="notifications-toggle"
            checked={notificationsEnabled}
            onCheckedChange={handleToggleNotifications}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-time" className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Reminder Time
          </Label>
          <Input
            id="reminder-time"
            type="time"
            value={reminderTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary"
            disabled={!notificationsEnabled}
          />
          <p className="text-xs text-muted-foreground">
            Choose when you want to be reminded to weigh yourself
          </p>
        </div>

        {notificationsEnabled && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary">
              ✅ You'll receive daily reminders at {reminderTime} to track your weight
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}