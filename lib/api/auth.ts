

import { apiClient } from './client'
import type { LoginRequest, LoginResponse, User } from '../types/auth'

class AuthService {

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // tRPC endpoint format: /api/trpc/[procedure]
      // Try direct JSON format first (most common tRPC format)
      console.log('[Auth Service] Calling login API with:', credentials)
      const response = await apiClient.post<LoginResponse['data']>('/api/trpc/admin.auth.login', credentials)
      console.log('[Auth Service] API Response:', response)
      
      if (response.success && response.data) {
        // Handle tRPC response - data might be nested
        const loginData = response.data as any
        
        // Extract token and user from response
        // Adjust these based on your actual API response structure
        const token = loginData.token || loginData.accessToken || loginData.access_token
        const user = loginData.user || loginData
        
        if (token && user && typeof window !== 'undefined') {
          localStorage.setItem('authToken', token)
          localStorage.setItem(
            'adminUser',
            JSON.stringify({
              id: user.id || user._id || '',
              email: user.email || credentials.email,
              role: user.role || 'admin',
              name: user.name || user.username || '',
            })
          )
          
          if (loginData.expiresIn) {
            const expirationTime = Date.now() + loginData.expiresIn * 1000
            localStorage.setItem('tokenExpiration', expirationTime.toString())  
          }
        }

        return {
          success: true,
          data: {
            token: token || '',
            user: {
              id: user.id || user._id || '',
              email: user.email || credentials.email,
              role: user.role || 'admin',
              name: user.name || user.username,
            },
            expiresIn: loginData.expiresIn,
          },
          message: 'Login successful',
        }
      }

      // Extract error message properly
      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Login failed'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('tokenExpiration')
    }
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem('adminUser')
    if (!userStr) return null

    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  }

  /**
   * Get auth token from storage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true
    
    const expiration = localStorage.getItem('tokenExpiration')
    if (!expiration) return false // No expiration set, assume valid
    
    return Date.now() > parseInt(expiration, 10)
  }

  /**
   * Verify token with backend (optional - for token validation)
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ valid: boolean }>('/auth/verify')
      return response.success && response.data?.valid === true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const authService = new AuthService()