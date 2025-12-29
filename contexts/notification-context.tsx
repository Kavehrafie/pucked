"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Notification, createNotification, NOTIFICATION_DURATIONS } from "@/lib/notifications";
import { NotificationContextType } from "@/types/components";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Prevent duplicate notifications with the same message
      const exists = prev.some((n) => n.message === notification.message && n.type === notification.type);
      if (exists) return prev;
      return [...prev, notification];
    });

    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        dismissNotification(notification.id);
      }, notification.duration);
    }
  }, [dismissNotification]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    addNotification(createNotification('success', message, duration ?? NOTIFICATION_DURATIONS.success));
  }, [addNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    addNotification(createNotification('error', message, duration ?? NOTIFICATION_DURATIONS.error));
  }, [addNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    addNotification(createNotification('warning', message, duration ?? NOTIFICATION_DURATIONS.warning));
  }, [addNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    addNotification(createNotification('info', message, duration ?? NOTIFICATION_DURATIONS.info));
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
