import { useEffect, useRef } from 'react'
import { config } from '@/lib/config'

export type SSEEvent<T = unknown> = {
  type: string
  data: T
}

type UseSSEOptions<T> = {
  /** BFF endpoint that exposes the SSE stream */
  endpoint: string
  /** Called on every received event */
  onEvent: (event: SSEEvent<T>) => void
  /** Enables or disables the connection (useful to connect only when authenticated) */
  enabled?: boolean
}

/**
 * Opens a persistent SSE connection to the BFF.
 * The browser reconnects automatically if the connection drops.
 *
 * Call this hook at the app root level (App.tsx) to keep the connection
 * alive across page navigations.
 */
export function useSSE<T = unknown>({ endpoint, onEvent, enabled = true }: UseSSEOptions<T>) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    if (!enabled) return

    const es = new EventSource(`${config.bffUrl}${endpoint}`, {
      withCredentials: true,
    })

    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data) as SSEEvent<T>
        onEventRef.current(parsed)
      } catch {
        console.warn('[SSE] Non-parseable event:', e.data)
      }
    }

    es.onerror = () => {
      if (import.meta.env.DEV) {
        console.warn('[SSE] Connection lost, reconnecting...')
      }
    }

    return () => {
      es.close()
    }
  }, [endpoint, enabled])
}
