/**
 * Admins API Service
 * Handles all admin-related API calls
 */

import { apiClient } from './client'
import type { AdminsResponse, GetAdminsParams } from '../types/admins'

class AdminsService {
  /**
   * Get all admins with pagination
   */
  async getAllAdmins(params?: GetAdminsParams): Promise<{ success: boolean; data?: AdminsResponse; error?: string; message?: string }> {
    try {
      // Build input with defaults as per API requirements
      const input: Record<string, any> = {
        page: params?.page || 1, // Default to 1
        limit: params?.limit || 20, // Default to 20
      }
      
      // Add search if provided
      if (params?.search) {
        input.search = params.search
      }

      console.log('[Admins Service] Fetching admins with params:', input)
      
      const response = await apiClient.post<AdminsResponse>('/api/trpc/admin.admins.getAll', input)
      
      console.log('[Admins Service] API Response:', response)

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Admins fetched successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to fetch admins'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Admins Service] Error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(adminId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!adminId || typeof adminId !== 'string' || adminId.trim() === '') {
        console.error('[Admins Service] adminId is missing or invalid')
        return {
          success: false,
          error: 'Admin ID is required',
        }
      }

      console.log('[Admins Service] Fetching admin by ID:', adminId)
      
      const requestBody = { adminId }
      
      console.log('[Admins Service] POST Body:', JSON.stringify(requestBody, null, 2))
      
      const response = await apiClient.post<any>('/api/trpc/admin.admins.getById', requestBody)
      
      console.log('[Admins Service] Get admin by ID response:', response)

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to fetch admin'

      return {
        success: false,
        error: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Admins Service] Get admin by ID error:', error)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Create new admin
   */
  async createAdmin(data: {
    firstName: string
    lastName?: string
    email: string
    password: string
  }): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      console.log('[Admins Service] Creating admin with data:', { ...data, password: '***' })
      
      const response = await apiClient.post<any>('/api/trpc/admin.admins.create', data)
      
      console.log('[Admins Service] Create response:', response)

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Admin created successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to create admin'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Admins Service] Create admin error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Update admin
   */
  async updateAdmin(data: {
    adminId: string
    firstName?: string
    lastName?: string
    email?: string
    password?: string
  }): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      // Validate adminId is present
      if (!data.adminId || typeof data.adminId !== 'string' || data.adminId.trim() === '') {
        console.error('[Admins Service] adminId is missing or invalid:', data)
        return {
          success: false,
          error: 'Admin ID is required',
          message: 'Admin ID is required',
        }
      }
      
      console.log('[Admins Service] Updating admin with data:', { ...data, password: data.password ? '***' : undefined })
      
      const response = await apiClient.post<any>('/api/trpc/admin.admins.update', data)
      
      console.log('[Admins Service] Update response:', response)

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Admin updated successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to update admin'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Admins Service] Update admin error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Delete admin by ID
   */
  async deleteAdmin(adminId: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      if (!adminId || typeof adminId !== 'string' || adminId.trim() === '') {
        console.error('[Admins Service] adminId is missing or invalid')
        return {
          success: false,
          error: 'Admin ID is required',
          message: 'Admin ID is required',
        }
      }

      console.log('[Admins Service] Deleting admin with ID:', adminId)
      
      const response = await apiClient.post<any>('/api/trpc/admin.admins.delete', { adminId })
      
      console.log('[Admins Service] Delete response:', response)

      if (response.success) {
        return {
          success: true,
          message: 'Admin deleted successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to delete admin'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Admins Service] Delete admin error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }
}

// Export singleton instance
export const adminsService = new AdminsService()
