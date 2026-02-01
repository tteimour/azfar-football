'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Trash2, X, Users, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Notification, NotificationType } from '@/types';
import { isDemoMode } from '@/lib/supabase';
import * as notifications from '@/lib/notifications';
import * as notificationStore from '@/lib/notificationStore';

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'join_request':
      return <Users className="w-4 h-4 text-blue-400" />;
    case 'request_approved':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'request_rejected':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'match_reminder':
      return <Clock className="w-4 h-4 text-yellow-400" />;
    case 'match_completed':
      return <Star className="w-4 h-4 text-purple-400" />;
    default:
      return <Bell className="w-4 h-4 text-gray-400" />;
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

      // Set up real-time subscription (only works in production mode)
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
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-green-400 hover:text-green-300 flex items-center space-x-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : notificationList.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {notificationList.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                    className={`p-4 hover:bg-gray-100/50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-gray-700/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={`text-sm font-medium ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="ml-2 p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                        {notification.message && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                          {notification.room_id && (
                            <Link
                              href={`/rooms/${notification.room_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-green-400 hover:text-green-300"
                            >
                              View match
                            </Link>
                          )}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
