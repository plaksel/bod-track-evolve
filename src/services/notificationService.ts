import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  static async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notifications not available on web platform');
      return false;
    }

    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }

  static async scheduleWeightReminder(time: string) {
    try {
      // Clear existing notifications first
      await this.clearWeightReminders();

      const [hours, minutes] = time.split(':').map(Number);
      
      // Schedule notification for the next 30 days
      const notifications = [];
      const now = new Date();
      
      for (let i = 0; i < 30; i++) {
        const notificationDate = new Date();
        notificationDate.setDate(now.getDate() + i);
        notificationDate.setHours(hours, minutes, 0, 0);
        
        // If the time has already passed today, start from tomorrow
        if (i === 0 && notificationDate <= now) {
          continue;
        }

        notifications.push({
          title: 'Weight Check-in',
          body: 'Time to record your weight for today! 📊',
          id: 1000 + i,
          schedule: { at: notificationDate },
          sound: 'default',
          actionTypeId: 'WEIGHT_REMINDER',
          extra: {
            type: 'weight_reminder'
          }
        });
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({
          notifications
        });
        
        console.log(`Scheduled ${notifications.length} weight reminders`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      return false;
    }
  }

  static async clearWeightReminders() {
    try {
      // Get all pending notifications
      const pending = await LocalNotifications.getPending();
      
      // Filter weight reminder notifications (IDs 1000-1029)
      const weightReminderIds = pending.notifications
        .filter(notification => notification.id >= 1000 && notification.id < 1030)
        .map(notification => notification.id);

      if (weightReminderIds.length > 0) {
        await LocalNotifications.cancel({
          notifications: weightReminderIds.map(id => ({ id }))
        });
        console.log(`Cleared ${weightReminderIds.length} weight reminders`);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  static async setupNotificationHandlers() {
    // Handle notification tap
    LocalNotifications.addListener('localNotificationActionPerformed', notification => {
      console.log('Notification tapped:', notification);
      
      if (notification.notification.extra?.type === 'weight_reminder') {
        // Navigate to weight entry (this could trigger a modal or navigate to the form)
        window.location.hash = '#weight-entry';
      }
    });
  }
}