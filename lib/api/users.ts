/**
 * Users API Service
 * Handles all user-related API calls
 */

import { apiClient } from './client'
import type { UsersResponse, GetUsersParams } from '../types/users'

class UsersService {
  /**
   * Get all users with pagination
   */
  async getAllUsers(params?: GetUsersParams): Promise<{ success: boolean; data?: UsersResponse; error?: string; message?: string }> {
    try {
      // Build input with defaults as per API requirements
      const input: Record<string, any> = {
        membershipStatus: params?.membershipStatus || "all", // Default to "all"
        page: params?.page || 1, // Default to 1
        limit: params?.limit || 10, // Default to 20
      }
      
      // Add search if provided
      if (params?.search) {
        input.search = params.search
      }

      console.log('[Users Service] Fetching users with params:', input)
      
      // tRPC POST format: { "0": { "json": input } }
       // input is the key, { json: input } is the value
      
      console.log('[Users Service] POST Body:', JSON.stringify(input, null, 2))
      
      const response = await apiClient.post<UsersResponse>('/api/trpc/admin.users.getAll', input)
      
      console.log('[Users Service] API Response:', response)

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Users fetched successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to fetch users'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Users Service] Error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.error('[Users Service] userId is missing or invalid')
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      console.log('[Users Service] Fetching user by ID:', userId)
      
      const requestBody = { userId }
      
      console.log('[Users Service] POST Body:', JSON.stringify(requestBody, null, 2))
      
      const response = await apiClient.post<any>('/api/trpc/admin.users.getById', requestBody)
      
      console.log('[Users Service] Get user by ID response:', response)

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
        : 'Failed to fetch user'

      return {
        success: false,
        error: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Users Service] Get user by ID error:', error)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Update user profile
   */
  async updateUser(data: {
    userId: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    password?: string
    birthday?: string
    profileImage?: string
    membershipStatus?: string
    membership?: {
      tier: string
      status: string
      startDate: string
      endDate: string
    }
  }): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      // Validate userId is present
      if (!data.userId || typeof data.userId !== 'string' || data.userId.trim() === '') {
        console.error('[Users Service] userId is missing or invalid:', data)
        return {
          success: false,
          error: 'User ID is required',
          message: 'User ID is required',
        }
      }
      
      console.log('[Users Service] Updating user with data:', data)
      console.log('[Users Service] UserId:', data.userId)
      
      // tRPC POST format: { "0": { "json": data } }
      // const tRPCBody = { data}
      
      console.log('[Users Service] POST Body:', JSON.stringify(data, null, 2))
      // console.log('[Users Service] POST Body userId check:', tRPCBody["0"])
      
      const response = await apiClient.post<any>('/api/trpc/admin.users.update', data)
      
      console.log('[Users Service] Update response:', response)

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'User updated successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to update user'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Users Service] Update user error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Delete user by ID
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.error('[Users Service] userId is missing or invalid')
        return {
          success: false,
          error: 'User ID is required',
          message: 'User ID is required',
        }
      }

      console.log('[Users Service] Deleting user with ID:', userId)
      
      const response = await apiClient.post<any>('/api/trpc/admin.users.delete', { userId })
      
      console.log('[Users Service] Delete response:', response)

      if (response.success) {
        return {
          success: true,
          message: 'User deleted successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to delete user'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Users Service] Delete user error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }
}

// Export singleton instance
export const usersService = new UsersService()

