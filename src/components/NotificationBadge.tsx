'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Trash2, X, Users, CheckCircle, XCircle, Clock, Star, BellOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Notification, NotificationType } from '@/types';
import { isDemoMode } from '@/lib/supabase';
import * as notifications from '@/lib/notifications';
import * as notificationStore from '@/lib/notificationStore';

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'join_request':
      return <Users className="w-4 h-4 text-neon-cyan" />;
    case 'request_approved':
      return <CheckCircle className="w-4 h-4 text-neon-green" />;
    case 'request_rejected':
      return <XCircle className="w-4 h-4 text-neon-red" />;
    case 'match_reminder':
      return <Clock className="w-4 h-4 text-neon-amber" />;
    case 'match_completed':
      return <Star className="w-4 h-4 text-neon-purple" />;
    default:
      return <Bell className="w-4 h-4 text-white/40" />;
  }
};

const getBorderColor = (type: NotificationType) => {
  switch (type) {
    case 'join_request':
      return 'border-l-neon-cyan';
    case 'request_approved':
      return 'border-l-neon-green';
    case 'request_rejected':
      return 'border-l-neon-red';
    case 'match_reminder':
      return 'border-l-neon-amber';
    case 'match_completed':
      return 'border-l-neon-purple';
    default:
      return 'border-l-white/20';
  }
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export default function NotificationBadge() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let items: Notification[];
      let count: number;

      if (isDemoMode) {
        items = notificationStore.getNotifications(user.id);
        count = notificationStore.getUnreadCount(user.id);
      } else {
        [items, count] = await Promise.all([
          notifications.getNotifications(user.id),
          notifications.getUnreadCount(user.id),
        ]);
      }

      setNotificationList(items);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();

      if (!isDemoMode) {
        const unsubscribe = notifications.subscribeToNotifications(user.id, (newNotification) => {
          setNotificationList(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });

        return () => unsubscribe();
      }
    }
  }, [user, loadNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    if (isDemoMode) {
      notificationStore.markAsRead(notificationId);
    } else {
      await notifications.markAsRead(notificationId);
    }

    setNotificationList(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    if (isDemoMode) {
      notificationStore.markAllAsRead(user.id);
    } else {
      await notifications.markAllAsRead(user.id);
    }

    setNotificationList(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const notification = notificationList.find(n => n.id === notificationId);
    const wasUnread = notification && !notification.is_read;

    if (isDemoMode) {
      notificationStore.deleteNotification(notificationId);
    } else {
      await notifications.deleteNotification(notificationId);
    }

    setNotificationList(prev => prev.filter(n => n.id !== notificationId));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-neon-green text-dark-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-green">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-dark-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/40 z-50 max-h-[80vh] overflow-hidden flex flex-col animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-heading font-semibold text-white">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-neon-green/70 hover:text-neon-green flex items-center space-x-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 scrollbar-dark">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
              </div>
            ) : notificationList.length > 0 ? (
              <div className="divide-y divide-white/5">
                {notificationList.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                    className={`group px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-200 border-l-2 ${getBorderColor(notification.type)} ${
                      !notification.is_read ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={`text-sm font-medium leading-tight ${!notification.is_read ? 'text-white' : 'text-white/60'}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="ml-2 p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-white/30 hover:text-neon-red" />
                          </button>
                        </div>
                        {notification.message && (
                          <p className="text-xs text-white/40 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-white/30">
                            {formatTime(notification.created_at)}
                          </span>
                          {notification.room_id && (
                            <Link
                              href={`/rooms/${notification.room_id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                              }}
                              className="text-[10px] text-neon-green/60 hover:text-neon-green transition-colors"
                            >
                              View match
                            </Link>
                          )}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-neon-green rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(0,255,136,0.4)]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/30">
                <BellOff className="w-10 h-10 mb-3" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-white/20 mt-1">You&apos;re all caught up</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
