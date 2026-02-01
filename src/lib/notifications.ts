import { supabase } from './supabase';
import { Notification } from '@/types';

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      related_user:profiles!notifications_related_user_id_fkey(id, full_name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    // Table might not exist yet (migration not run) - fail silently
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn('Notifications table not found. Run migration 003_notifications_chat_stadium.sql');
      return [];
    }
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data as Notification[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    // Table might not exist yet - fail silently
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return 0;
    }
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  return true;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}

export async function createNotification(notification: {
  user_id: string;
  type: Notification['type'];
  title: string;
  message?: string;
  room_id?: string;
  related_user_id?: string;
}): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return data as Notification;
}

export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
