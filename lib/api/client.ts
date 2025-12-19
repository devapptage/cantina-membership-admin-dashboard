export interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean>
}

class ApiClient {
    private baseURL: string

    constructor(baseURL?: string) {
        // Use environment variable or default to your API endpoint
        this.baseURL = baseURL || 'https://cantina-membership-app.vercel.app'
    }


    private getToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('authToken')
    }


    private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
        const url = new URL(endpoint, this.baseURL)

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value))
            })
        }

        return url.toString()
    }


    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const contentType = response.headers.get('content-type')
        const isJson = contentType?.includes('application/json')

        let data: any
        try {
            data = isJson ? await response.json() : await response.text()
            console.log('[API Client] Response data:', data)
        } catch (error) {
            console.error('[API Client] Failed to parse response:', error)
            throw new Error('Failed to parse response')
        }

        if (!response.ok) {
            // Handle tRPC error format
            let errorMessage: string
            if (isJson && data?.error) {
                // tRPC error format: { error: { message, code, data } }
                errorMessage = typeof data.error === 'string'
                    ? data.error
                    : data.error?.message || 'An error occurred'
            } else if (isJson && data?.message) {
                errorMessage = typeof data.message === 'string' ? data.message : 'An error occurred'
            } else {
                errorMessage = typeof data === 'string' ? data : `HTTP error! status: ${response.status}`
            }

            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            }
        }

        // Handle tRPC success response format
        // tRPC returns: { result: { data: {...} } } or { result: { data: { users: [], pagination: {} } } }
        let responseData = data
        if (isJson && data?.result?.data) {
            // tRPC format: { result: { data: {...} } }
            responseData = data.result.data
        } else if (isJson && data?.data) {
            // Direct data format
            responseData = data.data
        } else if (isJson && Array.isArray(data)) {
            // Array response
            responseData = data
        }

        console.log('[API Client] Extracted response data:', responseData)

        return {
            success: true,
            data: responseData as T,
            ...(isJson && data.message && { message: typeof data.message === 'string' ? data.message : undefined }),
        }
    }


    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const { params, headers = {}, ...fetchOptions } = options

        const url = this.buildURL(endpoint, params)
        const token = this.getToken()

        const defaultHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...headers,
        }

        try {
            console.log('[API Client] Making request to:', url)
            console.log('[API Client] Request body:', fetchOptions.body)
            console.log('[API Client] Request headers:', defaultHeaders)

            const response = await fetch(url, {
                ...fetchOptions,
                headers: defaultHeaders,
            })

            console.log('[API Client] Response status:', response.status)
            console.log('[API Client] Response ok:', response.ok)

            return this.handleResponse<T>(response)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Network error occurred'
            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            }
        }
    }


    async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        })
    }


    async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })
    }


    async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        })
    }


    async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        })
    }


    async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        })
    }
}

// Export singleton instance
export const apiClient = new ApiClient()