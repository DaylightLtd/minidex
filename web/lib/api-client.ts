/**
 * API client utility for making requests to Next.js proxy routes
 * All requests go through /api/* routes which proxy to the Vapor server
 */

import { API_BASE_URL } from '@/lib/query-client'

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

/**
 * Builds a URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  let url = path
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    url += `?${searchParams.toString()}`
  }
  return url
}

/**
 * Makes a request to a Next.js API proxy route
 * All requests automatically go through /api/* routes
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  // Ensure path starts with /api
  const apiPath = path.startsWith('/api') ? path : `${API_BASE_URL}${path}`
  const url = buildUrl(apiPath, params)

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }))
    throw new Error(error.message || `Request failed with status ${response.status}`)
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response.text() as unknown as T
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, data?: unknown, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(path: string, data?: unknown, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(path: string, data?: unknown, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
}
