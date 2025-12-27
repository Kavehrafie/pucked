/**
 * Notification System Types and Utilities
 * Provides a unified notification system for the admin area
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
}

/**
 * Generate a unique ID for notifications
 */
export function generateNotificationId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a notification object
 */
export function createNotification(
  type: NotificationType,
  message: string,
  duration: number = 5000
): Notification {
  return {
    id: generateNotificationId(),
    type,
    message,
    duration,
  };
}

/**
 * Default durations for different notification types
 */
export const NOTIFICATION_DURATIONS = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
} as const;
