import { ChatMessage, User } from '@/types';

const STORAGE_KEY = 'zapolya_chat_messages';

function getChatMessagesFromStorage(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveChatMessagesToStorage(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function getChatMessages(roomId: string): ChatMessage[] {
  return getChatMessagesFromStorage()
    .filter(m => m.room_id === roomId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function sendChatMessage(
  roomId: string,
  userId: string,
  message: string,
  user?: User
): ChatMessage {
  const messages = getChatMessagesFromStorage();

  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    room_id: roomId,
    user_id: userId,
    message,
    user,
    created_at: new Date().toISOString(),
  };

  messages.push(newMessage);
  saveChatMessagesToStorage(messages);
  return newMessage;
}

// Demo mode doesn't support real-time subscriptions
// Returns a no-op cleanup function
export function subscribeToChatMessages(
  _roomId: string,
  _onMessage: (message: ChatMessage) => void
): () => void {
  return () => {};
}
