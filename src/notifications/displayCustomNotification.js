import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// Call this function to display a Cove-style custom notification
export async function displayCustomNotification({ name, message }) {
  // Create a channel (do this once, ideally at app startup)
  await notifee.createChannel({
    id: 'cove',
    name: 'Cove Notifications',
    importance: AndroidImportance.HIGH,
  });

  // Display the notification
  await notifee.displayNotification({
    title: name,
    body: message,
    android: {
      channelId: 'cove',
      smallIcon: 'ic_launcher', // Make sure you have this icon in your android/app/src/main/res
      color: '#2A7BFF', // Cove blue or your brand color
      actions: [
        {
          title: 'Mark as Read',
          pressAction: { id: 'mark-as-read' },
        },
      ],
    },
  });
}

// Listen for notification action events (call this once, e.g. in App.js)
export function registerCustomNotificationHandler(onMarkAsRead) {
  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'mark-as-read') {
      if (onMarkAsRead) onMarkAsRead(detail.notification);
    }
  });
}
