"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  AcceptButton,
  DeclineButton,
} from "@/src/components/buttons/InvitationActionButtons";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  invitationId: string | null;
  invitation: {
    status: string;
    projectId: string | null;
  } | null;
};

function formatRelativeTime(createdAt: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000,
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const response = await fetch("/api/notifications");

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }, []);

  useEffect(() => {
    async function load() {
      await fetchNotifications();
    }

    load();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((notification) => notification.readAt === null)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    await Promise.allSettled(
      unreadIds.map((id) =>
        fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
      )
    );

    fetchNotifications();
  };

  const handleBellClick = () => {
    const opening = !open;
    setOpen(!open);

    if (opening && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleBellClick}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Notifications"
        className="relative flex size-10 items-center justify-center rounded-lg border border-base-200 bg-base-100 text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-error-content">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-base-200 bg-base-100 shadow-xl">
          <div className="border-b border-base-200 px-4 py-3">
            <span className="text-sm font-semibold text-base-content">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-base-content/50">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-base-200/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-base-200/50 ${
                    notification.readAt === null ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-sm font-medium text-base-content">
                      {notification.title}
                    </strong>
                    <span className="mt-0.5 shrink-0 text-[10px] whitespace-nowrap text-base-content/40">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-base-content/60">
                    {notification.message}
                  </p>
                  {notification.type === "INVITATION" &&
                    notification.invitationId &&
                    notification.invitation?.status === "PENDING" && (
                      <div className="mt-2 flex items-center gap-2">
                        <AcceptButton
                          invitationId={notification.invitationId}
                          onDone={fetchNotifications}
                        />
                        <DeclineButton
                          invitationId={notification.invitationId}
                          onDone={fetchNotifications}
                        />
                      </div>
                    )}
                  {notification.type !== "INVITATION" &&
                    notification.readAt === null && (
                      <span className="mt-1.5 block h-1 w-8 rounded-full bg-error" />
                    )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
