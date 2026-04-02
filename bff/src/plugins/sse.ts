import type { FastifyReply } from 'fastify'

type SSEClient = {
  userId: string
  reply: FastifyReply
}

type SSEEvent = {
  type: string
  data: unknown
}

/**
 * Manages open SSE connections per user.
 *
 * A single user may have multiple tabs open (multiple connections).
 * When an event arrives, it is sent to all connections for that user.
 *
 * For multi-instance deployments, replace with Redis Pub/Sub.
 */
class SSEManager {
  private clients = new Map<string, Set<SSEClient>>()
  private eventCounter = 0

  add(client: SSEClient): void {
    if (!this.clients.has(client.userId)) {
      this.clients.set(client.userId, new Set())
    }
    this.clients.get(client.userId)!.add(client)
  }

  remove(client: SSEClient): void {
    const userClients = this.clients.get(client.userId)
    if (!userClients) return
    userClients.delete(client)
    if (userClients.size === 0) {
      this.clients.delete(client.userId)
    }
  }

  sendToUser(userId: string, event: SSEEvent): void {
    const userClients = this.clients.get(userId)
    if (!userClients || userClients.size === 0) return

    this.eventCounter++
    const payload = this.format(event, this.eventCounter)
    const failed: SSEClient[] = []

    for (const client of userClients) {
      try {
        client.reply.raw.write(payload)
      } catch {
        failed.push(client)
      }
    }

    for (const client of failed) {
      this.remove(client)
    }
  }

  broadcast(event: SSEEvent): void {
    this.eventCounter++
    const payload = this.format(event, this.eventCounter)
    const failed: SSEClient[] = []

    for (const userClients of this.clients.values()) {
      for (const client of userClients) {
        try {
          client.reply.raw.write(payload)
        } catch {
          failed.push(client)
        }
      }
    }

    for (const client of failed) {
      this.remove(client)
    }
  }

  get connectedCount(): number {
    let count = 0
    for (const userClients of this.clients.values()) {
      count += userClients.size
    }
    return count
  }

  private format(event: SSEEvent, id: number): string {
    return [
      `id: ${id}`,
      `data: ${JSON.stringify({ type: event.type, data: event.data })}`,
      '',
      '',
    ].join('\n')
  }
}

export const sseManager = new SSEManager()
