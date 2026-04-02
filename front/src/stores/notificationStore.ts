import { create } from 'zustand'

export type Notification = {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  readAt: string | null
  createdAt: string
}

type NotificationStore = {
  notifications: Notification[]
  add: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clear: () => void
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],

  add: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
    })),

  clear: () => set({ notifications: [] }),
}))

export const selectUnreadCount = (state: NotificationStore) =>
  state.notifications.filter((n) => !n.readAt).length
