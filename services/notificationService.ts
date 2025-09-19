import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Show completion notification when timer ends
   */
  static async showTimerCompletionNotification(timeString: string): Promise<void> {
    try {
      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Congratulations!',
          body: `You've locked in for ${timeString}`,
          sound: true,
        },
        trigger: null,
      });

      // Show alert
      Alert.alert(
        'Congratulations!',
        `You've locked in for ${timeString}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback to just alert if notification fails
      Alert.alert(
        'Congratulations!',
        `You've locked in for ${timeString}`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
}