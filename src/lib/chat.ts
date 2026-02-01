import { supabase } from './supabase';
import { ChatMessage } from '@/types';

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    // Table might not exist yet (migration not run) - fail silently
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn('Chat messages table not found. Run migration 003_notifications_chat_stadium.sql');
      return [];
    }
    console.error('Error fetching chat messages:', error);
    return [];
  }

  return data as ChatMessage[];
}

export async function sendChatMessage(
  roomId: string,
  userId: string,
  message: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      user_id: userId,
      message,
    })
    .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
    .single();

  if (error) {
    // Table might not exist yet - fail silently
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn('Chat messages table not found. Run migration 003_notifications_chat_stadium.sql');
      return null;
    }
    console.error('Error sending chat message:', error);
    return null;
  }

  return data as ChatMessage;
}

export function subscribeToChatMessages(
  roomId: string,
  onMessage: (message: ChatMessage) => void
): () => void {
  const channel = supabase
    .channel(`chat:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        // Fetch user data for the message
        const { data: userData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', payload.new.user_id)
          .single();

        const messageWithUser: ChatMessage = {
          ...payload.new as ChatMessage,
          user: userData || undefined,
        };

        onMessage(messageWithUser);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
