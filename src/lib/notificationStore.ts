import { Notification, NotificationType } from '@/types';

const STORAGE_KEY = 'tapadam_notifications';

function getNotificationsFromStorage(): Notification[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveNotificationsToStorage(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function getNotifications(userId: string): Notification[] {
  return getNotificationsFromStorage()
    .filter(n => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getUnreadCount(userId: string): number {
  return getNotificationsFromStorage()
    .filter(n => n.user_id === userId && !n.is_read)
    .length;
}

export function markAsRead(notificationId: string): boolean {
  const notifications = getNotificationsFromStorage();
  const index = notifications.findIndex(n => n.id === notificationId);
  if (index === -1) return false;

  notifications[index].is_read = true;
  saveNotificationsToStorage(notifications);
  return true;
}

export function markAllAsRead(userId: string): boolean {
  const notifications = getNotificationsFromStorage();
  notifications.forEach(n => {
    if (n.user_id === userId) {
      n.is_read = true;
    }
  });
  saveNotificationsToStorage(notifications);
  return true;
}

export function deleteNotification(notificationId: string): boolean {
  const notifications = getNotificationsFromStorage();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotificationsToStorage(filtered);
  return true;
}

export function createNotification(notification: {
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  room_id?: string;
  related_user_id?: string;
}): Notification {
  const notifications = getNotificationsFromStorage();

  const newNotification: Notification = {
    id: Date.now().toString(),
    user_id: notification.user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    room_id: notification.room_id,
    related_user_id: notification.related_user_id,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  notifications.push(newNotification);
  saveNotificationsToStorage(notifications);
  return newNotification;
}

// Demo mode doesn't support real-time subscriptions
export function subscribeToNotifications(
  _userId: string,
  _onNotification: (notification: Notification) => void
): () => void {
  // Return a no-op cleanup function
  return () => {};
}
