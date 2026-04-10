export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.error("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendLocalNotification = async (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    // Try SW notification first (better for PWA)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          vibrate: [200, 100, 200],
        } as any);
        return;
      }
    }

    // Fallback to basic notification
    new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
    });
  }
};

// Logic to check if we should send a notification (e.g. at XX:01)
export const checkAndNotify = (lastNotifiedHour: number | null) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Notification exactly at :00 or :01
  if (currentMinute === 1) {
    if (lastNotifiedHour !== currentHour) {
      sendLocalNotification(
        "onTask: Time to log!",
        `How did you spend the last hour? Click to check in.`
      );
      return currentHour;
    }
  }
  return lastNotifiedHour;
};
