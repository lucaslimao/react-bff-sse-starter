import { useNotificationStore, selectUnreadCount } from '@/stores/notificationStore'

export function HomePage() {
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore(selectUnreadCount)

  return (
    <main className="p-8">
      <h1 className="text-2xl font-medium mb-4">
        Notifications{' '}
        {unreadCount > 0 && (
          <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </h1>

      {notifications.length === 0 && (
        <p className="text-gray-500 text-sm">No notifications.</p>
      )}

      <ul className="flex flex-col gap-2">
        {notifications.map((n) => (
          <li key={n.id} className="border rounded-lg p-4 text-sm">
            <p className="font-medium">{n.title}</p>
            <p className="text-gray-500">{n.message}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
