import type { ApiResponse, PageParams } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: {
          message: data.message || 'Request failed',
          code: data.code,
          details: data.details,
        },
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR',
      },
    }
  }
}

export const apiClient = {
  get: <T>(endpoint: string, params?: PageParams) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return request<T>(`${endpoint}${query}`, { method: 'GET' })
  },

  post: <T>(endpoint: string, body?: unknown) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  put: <T>(endpoint: string, body?: unknown) => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  delete: <T>(endpoint: string) => {
    return request<T>(endpoint, { method: 'DELETE' })
  },
}

export default apiClient
