'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AppNotification } from '@/lib/types';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from '@/lib/store';
import {
  Bell,
  Video,
  Radio,
  FileText,
  Shield,
  Check,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const list = await fetchNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    const handleNewNotif = (e: any) => {
      const newNotif: AppNotification = e.detail;
      loadNotifications();
      setActiveToast(newNotif);
      setTimeout(() => {
        setActiveToast((current) => (current?.id === newNotif.id ? null : current));
      }, 6000);
    };

    window.addEventListener('dss-notifications-updated', handleUpdate);
    window.addEventListener('dss-new-notification', handleNewNotif);

    return () => {
      window.removeEventListener('dss-notifications-updated', handleUpdate);
      window.removeEventListener('dss-new-notification', handleNewNotif);
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
    await loadNotifications();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsAsRead();
    await loadNotifications();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    await loadNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <Video className="w-4 h-4 text-red-500" />;
      case 'live':
        return <Radio className="w-4 h-4 text-red-400 animate-pulse" />;
      case 'notes':
        return <FileText className="w-4 h-4 text-amber-400" />;
      default:
        return <Shield className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast popup for live alerts */}
      {activeToast && (
        <div className="fixed top-16 right-6 z-50 max-w-sm w-full bg-[#0F0F18] border-2 border-red-600/80 rounded-xl p-4 shadow-2xl shadow-red-950/60 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-900/60 shrink-0">
              {getIcon(activeToast.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-red-400 font-bold bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40">
                  {activeToast.courseTitle}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Just now</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">{activeToast.title}</h4>
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">{activeToast.message}</p>
              {activeToast.actionLink && (
                <Link
                  href={activeToast.actionLink}
                  onClick={() => setActiveToast(null)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-red-400 hover:text-red-300 font-semibold"
                >
                  <span>Open Track</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="View Notifications"
        className="relative p-2 rounded-lg border border-zinc-800 bg-[#0A0A10] text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-[#12121C] transition-all flex items-center justify-center"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-red-400' : 'text-zinc-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold flex items-center justify-center border-2 border-[#050508] shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#09090F] border border-[#1E1E28] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 bg-[#0D0D14] border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Learner Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-red-950/80 text-red-400 text-[10px] font-mono font-bold border border-red-900/60">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  title="Mark all as read"
                  className="text-[11px] text-zinc-400 hover:text-white font-mono flex items-center gap-1 hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  title="Clear notifications"
                  className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-900">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2 text-zinc-500">
                <Bell className="w-8 h-8 opacity-40" />
                <p className="text-xs font-mono">No notifications at this time.</p>
                <p className="text-[10px] text-zinc-600">
                  When instructors schedule live classes, upload lectures, or post notes, you will receive alerts here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    if (n.actionLink) {
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    !n.read ? 'bg-[#12121E]/80 hover:bg-[#161626]' : 'bg-transparent hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono uppercase text-red-400 font-bold truncate max-w-[180px]">
                        {n.courseTitle}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white mt-0.5 line-clamp-1">{n.title}</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-tight">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/40">
                      {n.actionLink ? (
                        <Link
                          href={n.actionLink}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-mono text-red-400 hover:text-red-300 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Open Track</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      ) : (
                        <span />
                      )}

                      {!n.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          title="Mark read"
                          className="text-[10px] font-mono text-zinc-500 hover:text-white flex items-center gap-0.5"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
