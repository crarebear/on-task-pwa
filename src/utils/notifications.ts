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

export const sendLocalNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
    });

    notification.onclick = () => {
      window.focus();
      // In a real app, this would route to the log tab
      notification.close();
    };
  }
};

// Logic to check if we should send a notification (e.g. at XX:01)
export const checkAndNotify = (lastNotifiedHour: number | null) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Between 9am and 10pm (inclusive for the preceding 8am-9am window etc)
  // Request says "at 9:01am... until 10:01pm"
  if (currentHour >= 9 && currentHour <= 22 && currentMinute === 1) {
    if (lastNotifiedHour !== currentHour) {
      sendLocalNotification(
        "onTask: Time to log!",
        `How did you spend the last hour (${currentHour - 1}:00- ${currentHour}:00)?`
      );
      return currentHour;
    }
  }
  return lastNotifiedHour;
};
