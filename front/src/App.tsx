import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryProvider } from '@/lib/query'
import { useSSE } from '@/hooks/useSSE'
import { useNotificationStore, type Notification } from '@/stores/notificationStore'
import { HomePage } from '@/pages/HomePage'

function SSEProvider() {
  const add = useNotificationStore((s) => s.add)

  useSSE<Notification>({
    endpoint: '/events',
    onEvent: (event) => {
      if (event.type === 'notification') {
        add(event.data)
      }
    },
  })

  return null
}

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <SSEProvider />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add routes here */}
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  )
}
