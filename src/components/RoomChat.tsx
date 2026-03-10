'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Send, User, MessageCircle, ChevronDown } from 'lucide-react';
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
          const msg = sentMessage;
          setMessages(prev => [...prev, msg]);
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
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 text-slate-400">
          <MessageCircle className="w-5 h-5 text-neon-green/50" />
          <span className="text-sm">Join the match to access the chat</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-neon-green" />
          <h2 className="font-heading font-bold text-lg text-white">Chat</h2>
          {messages.length > 0 && (
            <span className="badge badge-green text-xs">
              {messages.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
            isCollapsed ? '-rotate-90' : 'rotate-0'
          }`}
        />
      </button>

      {/* Collapsible body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0' : 'max-h-[500px]'
        }`}
      >
        <div className="px-5 pb-5">
          {/* Messages Container */}
          <div className="h-64 overflow-y-auto rounded-lg bg-dark-950/60 p-4 space-y-3 scrollbar-dark">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => {
                  const isOwn = message.user_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2.5 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {message.user?.avatar_url ? (
                            <Image
                              src={message.user.avatar_url}
                              alt={message.user.full_name || 'User'}
                              width={28}
                              height={28}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>

                        {/* Message bubble */}
                        <div
                          className={`rounded-xl px-3.5 py-2.5 ${
                            isOwn
                              ? 'bg-neon-green/10 border-l-2 border-neon-green'
                              : 'bg-white/5'
                          }`}
                        >
                          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                            <span className={`text-[11px] font-semibold ${isOwn ? 'text-neon-green' : 'text-neon-cyan'}`}>
                              {message.user?.full_name || 'Unknown'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 break-words leading-relaxed">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm font-medium">No messages yet.</p>
                <p className="text-xs mt-0.5">Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
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
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green hover:bg-neon-green/20 hover:shadow-glow-green-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-neon-green/10 disabled:hover:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
