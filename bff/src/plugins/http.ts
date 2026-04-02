/**
 * Internal HTTP client for calling external APIs from the BFF.
 * Set EXTERNAL_API_URL in your .env per project.
 */
const BASE_URL = process.env.EXTERNAL_API_URL ?? ''

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error('EXTERNAL_API_URL env var is required. Set it in your .env file.')
  }

  const { body, headers, ...rest } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      // Add auth headers here if needed
      // Authorization: `Bearer ${process.env.API_TOKEN}`,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'External API error' }))
    throw new Error(error.message ?? `HTTP ${response.status}`)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', body, ...options }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body, ...options }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body, ...options }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
}
