/**
 * Notifications API Service
 * Handles all notification-related API calls
 */

import { apiClient } from './client'
import type { NotificationsResponse, CreateNotificationData, Notification, GetNotificationsParams } from '../types/notifications'

class NotificationsService {
  /**
   * Get all notifications with filters
   */
  async getAllNotifications(params?: GetNotificationsParams): Promise<{ success: boolean; data?: NotificationsResponse; error?: string; message?: string }> {
    try {
      // Build input with defaults
      const input: Record<string, any> = {
        status: params?.status || "all",
        page: params?.page || 1,
        limit: params?.limit || 50,
      }
      
      // Add optional parameters
      if (params?.search) {
        input.search = params.search
      }
      if (params?.targetTier) {
        input.targetTier = params.targetTier
      }

      console.log('[Notifications Service] Fetching notifications with params:', input)
      console.log('[Notifications Service] POST Body:', JSON.stringify(input, null, 2))
      
      const response = await apiClient.post<NotificationsResponse>('/api/trpc/admin.notifications.getAll', input)
      
      console.log('[Notifications Service] API Response:', response)

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Notifications fetched successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to fetch notifications'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Notifications Service] Get all notifications error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Create new notification
   */
  async createNotification(data: CreateNotificationData): Promise<{ success: boolean; data?: Notification; error?: string; message?: string }> {
    try {
      // Validate required fields
      if (!data.title || data.title.trim().length === 0) {
        return {
          success: false,
          error: 'Title is required',
          message: 'Title is required',
        }
      }

      if (data.title.length > 100) {
        return {
          success: false,
          error: 'Title must be 100 characters or less',
          message: 'Title must be 100 characters or less',
        }
      }

      if (!data.body || data.body.trim().length === 0) {
        return {
          success: false,
          error: 'Body is required',
          message: 'Body is required',
        }
      }

      if (data.body.length > 500) {
        return {
          success: false,
          error: 'Body must be 500 characters or less',
          message: 'Body must be 500 characters or less',
        }
      }

      // Set defaults
      const notificationData: CreateNotificationData = {
        title: data.title.trim(),
        body: data.body.trim(),
        targetTier: data.targetTier || 'all',
        type: data.type || 'general',
        ...(data.scheduledFor && { scheduledFor: data.scheduledFor }),
      }

      console.log('[Notifications Service] Creating notification with data:', notificationData)
      console.log('[Notifications Service] POST Body:', JSON.stringify(notificationData, null, 2))
      
      const response = await apiClient.post<Notification>('/api/trpc/admin.notifications.create', notificationData)
      
      console.log('[Notifications Service] Create notification response:', response)

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Notification created successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to create notification'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Notifications Service] Create notification error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService()

