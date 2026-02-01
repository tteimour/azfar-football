'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Send, User, MessageCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { ChatMessage } from '@/types';
import { isDemoMode } from '@/lib/supabase';
import * as chat from '@/lib/chat';
import * as chatStore from '@/lib/chatStore';

interface RoomChatProps {
  roomId: string;
  isParticipant: boolean;
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

export default function RoomChat({ roomId, isParticipant }: RoomChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      let chatMessages: ChatMessage[];

      if (isDemoMode) {
        chatMessages = chatStore.getChatMessages(roomId);
      } else {
        chatMessages = await chat.getChatMessages(roomId);
      }

      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (isParticipant) {
      loadMessages();

      // Set up real-time subscription (only works in production mode)
      if (!isDemoMode) {
        const unsubscribe = chat.subscribeToChatMessages(roomId, (newMsg) => {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        });

        return () => unsubscribe();
      }
    }
  }, [roomId, isParticipant, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      let sentMessage: ChatMessage | null;

      if (isDemoMode) {
        sentMessage = chatStore.sendChatMessage(roomId, user.id, newMessage.trim(), user);
        if (sentMessage) {
          setMessages(prev => [...prev, sentMessage]);
        }
      } else {
        sentMessage = await chat.sendChatMessage(roomId, user.id, newMessage.trim());
        // In production, the message will arrive via the realtime subscription
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isParticipant) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 text-gray-400">
          <MessageCircle className="w-5 h-5" />
          <span>Join the match to access the chat</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full text-left"
      >
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Chat</span>
          {messages.length > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({messages.length} messages)
            </span>
          )}
        </h2>
        <span className="text-gray-400 text-sm">
          {isCollapsed ? 'Show' : 'Hide'}
        </span>
      </button>

      {!isCollapsed && (
        <div className="mt-4">
          {/* Messages Container */}
          <div className="h-64 overflow-y-auto bg-gray-100 rounded-lg p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.user_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {message.user?.avatar_url ? (
                        <Image
                          src={message.user.avatar_url}
                          alt={message.user.full_name || 'User'}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div
                      className={`max-w-[70%] ${
                        message.user_id === user?.id
                          ? 'bg-green-100 rounded-tl-lg'
                          : 'bg-white rounded-tr-lg shadow-sm'
                      } rounded-bl-lg rounded-br-lg p-3`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          {message.user?.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 break-words">{message.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Be the first to say hello!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="mt-3 flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="input flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
