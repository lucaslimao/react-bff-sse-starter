import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sseManager } from '../plugins/sse.js'

const webhookBodySchema = z.object({
  userId: z.string(),
  type: z.string(),
  data: z.record(z.unknown()),
})

/**
 * POST /webhook/notification
 *
 * Called by the Notification Service when there is an event to deliver.
 * Validates the shared secret and pushes the event via SSE to the target user.
 */
export async function webhookRoute(app: FastifyInstance) {
  app.post('/webhook/notification', async (request, reply) => {
    const secret = request.headers['x-webhook-secret']
    if (secret !== process.env.WEBHOOK_SECRET) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const result = webhookBodySchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ message: 'Invalid payload', errors: result.error.issues })
    }

    const { userId, type, data } = result.data

    sseManager.sendToUser(userId, { type, data })

    return reply.status(200).send({ delivered: true })
  })
}
