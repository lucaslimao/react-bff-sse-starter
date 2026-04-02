import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

/**
 * Example domain module.
 * Each product feature becomes a module here.
 *
 * Rename this file and folder to match your domain:
 * e.g. src/modules/patients/, src/modules/products/
 */

const createSchema = z.object({
  name: z.string().min(1),
})

export async function exampleModule(app: FastifyInstance) {
  app.get('/example', async (_request, reply) => {
    // Replace with your actual external API call:
    // const data = await http.get<Example[]>('/api/example')
    return reply.send({ items: [] })
  })

  app.post('/example', async (request, reply) => {
    const result = createSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ errors: result.error.issues })
    }

    // const created = await http.post('/api/example', result.data)
    return reply.status(201).send({ message: 'Created' })
  })
}
