import type { FastifyInstance } from 'fastify'
import { sseManager } from '../plugins/sse.js'

/**
 * GET /events
 *
 * The front connects here via EventSource.
 * The connection stays open and the server pushes events as they occur.
 *
 * Query params:
 *   userId - user identifier (replace with your auth logic)
 */
export async function eventsRoute(app: FastifyInstance) {
  app.get('/events', (request, reply) => {
    // TODO: extract userId from JWT/session using your auth logic
    const { userId = 'anonymous' } = request.query as { userId?: string }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    const client = { userId, reply }
    sseManager.add(client)

    reply.raw.write(
      `data: ${JSON.stringify({ type: 'connected', data: { userId } })}\n\n`,
    )

    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(': heartbeat\n\n')
      } catch {
        clearInterval(heartbeat)
      }
    }, 30_000)

    request.raw.on('close', () => {
      clearInterval(heartbeat)
      sseManager.remove(client)
    })

    return new Promise<void>((resolve) => {
      request.raw.on('close', resolve)
    })
  })
}
