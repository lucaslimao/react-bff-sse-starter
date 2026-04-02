import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import { eventsRoute } from './routes/events.js'
import { webhookRoute } from './routes/webhook.js'
import { exampleModule } from './modules/example.js'

if (!process.env.WEBHOOK_SECRET) {
  throw new Error('WEBHOOK_SECRET env var is required')
}

const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty' }
        : undefined,
  },
})

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
})

await app.register(swagger, {
  openapi: {
    info: {
      title: 'BFF API',
      version: '1.0.0',
    },
  },
})

await app.register(swaggerUi, {
  routePrefix: '/docs',
})

app.get('/health', async () => ({ status: 'ok' }))

await app.register(eventsRoute)
await app.register(webhookRoute)

// Register your domain modules here
await app.register(exampleModule)

const port = Number(process.env.PORT ?? 3001)

try {
  await app.listen({ port, host: '0.0.0.0' })
  app.log.info(`BFF running at http://localhost:${port}`)
  app.log.info(`Swagger at http://localhost:${port}/docs`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
