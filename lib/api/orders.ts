/**
 * Orders API Service
 * Handles all order-related API calls
 */

import { apiClient } from './client'
import type { OrdersResponse, GetOrdersParams, UpdateOrderData, Order, ApiOrder } from '../types/orders'

class OrdersService {
  /**
   * Transform API order to frontend order format
   */
  private transformOrder(apiOrder: ApiOrder): Order {
    const itemCount = apiOrder.merchandiseItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
    
    // Generate a short user ID for display (last 8 characters)
    const shortUserId = apiOrder.userId ? apiOrder.userId.slice(-8) : 'Unknown'
    
    return {
      id: apiOrder._id || apiOrder.id,
      orderId: apiOrder._id || apiOrder.id,
      userId: apiOrder.userId,
      customerName: apiOrder.user?.firstName && apiOrder.user?.lastName
        ? `${apiOrder.user.firstName} ${apiOrder.user.lastName}`
        : `Customer ${shortUserId}`,
      customerEmail: apiOrder.user?.email || `user-${shortUserId}@example.com`,
      type: apiOrder.type,
      items: apiOrder.merchandiseItems || [],
      itemCount,
      orderNumber: apiOrder.OrderNumber || `ORD-${shortUserId.toUpperCase()}-${apiOrder._id.slice(-4).toUpperCase()}`,
      totalAmount: apiOrder.amount,
      status: apiOrder.status,
      paymentStatus: apiOrder.status === 'completed' ? 'completed' : apiOrder.status === 'cancelled' ? 'failed' : 'pending',
      stripePaymentIntentId: apiOrder.stripePaymentIntentId,
      createdAt: apiOrder.createdAt,
      updatedAt: apiOrder.updatedAt,
    }
  }

  /**
   * Get all orders with pagination and filters
   */
  async getAllOrders(params?: GetOrdersParams): Promise<{ success: boolean; data?: OrdersResponse; error?: string; message?: string }> {
    try {
      // Build input with defaults as per API requirements
      const input: Record<string, any> = {
        page: params?.page || 1,
        limit: params?.limit || 20,
      }
      
      // Add optional parameters
      if (params?.search) {
        input.search = params.search
      }
      if (params?.type) {
        input.type = params.type
      }
      if (params?.status) {
        input.status = params.status
      }
      if (params?.dateFrom) {
        input.dateFrom = params.dateFrom
      }
      if (params?.dateTo) {
        input.dateTo = params.dateTo
      }

      console.log('[Orders Service] Fetching orders with params:', input)
      
      console.log('[Orders Service] POST Body:', JSON.stringify(input, null, 2))
      
      const response = await apiClient.post<any>('/api/trpc/admin.orders.getAll', input)
      
      console.log('[Orders Service] API Response:', response)

      // Handle nested data structure: response.data.data
      let ordersData = response.data
      if (response.success && response.data?.data) {
        ordersData = response.data.data
      }

      if (response.success && ordersData?.orders && ordersData?.pagination) {
        // Transform orders to frontend format
        const transformedOrders = ordersData.orders.map((order: ApiOrder) => this.transformOrder(order))
        
        return {
          success: true,
          data: {
            orders: transformedOrders,
            pagination: ordersData.pagination,
          },
          message: 'Orders fetched successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to fetch orders'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Orders Service] Error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
    try {
      if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
        console.error('[Orders Service] orderId is missing or invalid')
        return {
          success: false,
          error: 'Order ID is required',
        }
      }

      console.log('[Orders Service] Fetching order by ID:', orderId)
      
      const requestBody = { orderId }
      
      console.log('[Orders Service] POST Body:', JSON.stringify(requestBody, null, 2))
      
      const response = await apiClient.post<any>('/api/trpc/admin.orders.getById', requestBody)
      
      console.log('[Orders Service] Get order by ID response:', response)

      // Handle nested data structure
      let orderData = response.data
      if (response.success && response.data?.data) {
        orderData = response.data.data
      }

      if (response.success && orderData) {
        const transformedOrder = this.transformOrder(orderData as ApiOrder)
        return {
          success: true,
          data: transformedOrder,
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to fetch order'

      return {
        success: false,
        error: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Orders Service] Get order by ID error:', error)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Update order
   */
  async updateOrder(data: UpdateOrderData): Promise<{ success: boolean; data?: Order; error?: string; message?: string }> {
    try {
      // Validate orderId is present
      if (!data.orderId || typeof data.orderId !== 'string' || data.orderId.trim() === '') {
        console.error('[Orders Service] orderId is missing or invalid:', data)
        return {
          success: false,
          error: 'Order ID is required',
          message: 'Order ID is required',
        }
      }
      
      console.log('[Orders Service] Updating order with data:', data)
      
      console.log('[Orders Service] POST Body:', JSON.stringify(data, null, 2))
      
      const response = await apiClient.post<any>('/api/trpc/admin.orders.update', data)
      
      console.log('[Orders Service] Update response:', response)

      // Handle nested data structure
      let orderData = response.data
      if (response.success && response.data?.data) {
        orderData = response.data.data
      }

      if (response.success) {
        const transformedOrder = orderData ? this.transformOrder(orderData as ApiOrder) : undefined
        return {
          success: true,
          data: transformedOrder,
          message: 'Order updated successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to update order'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Orders Service] Update order error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Delete order by ID
   */
  async deleteOrder(orderId: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
        console.error('[Orders Service] orderId is missing or invalid')
        return {
          success: false,
          error: 'Order ID is required',
          message: 'Order ID is required',
        }
      }

      console.log('[Orders Service] Deleting order with ID:', orderId)
      
      const response = await apiClient.post<any>('/api/trpc/admin.orders.delete', { orderId })
      
      console.log('[Orders Service] Delete response:', response)

      if (response.success) {
        return {
          success: true,
          message: 'Order deleted successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to delete order'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Orders Service] Delete order error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Export orders to CSV
   */
  async exportOrders(params?: GetOrdersParams): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const input: Record<string, any> = {}
      
      // Add optional parameters
      if (params?.search) {
        input.search = params.search
      }
      if (params?.type) {
        input.type = params.type
      }
      if (params?.status) {
        input.status = params.status
      }
      if (params?.dateFrom) {
        input.dateFrom = params.dateFrom
      }
      if (params?.dateTo) {
        input.dateTo = params.dateTo
      }

      console.log('[Orders Service] Exporting orders with params:', input)
      
      const response = await apiClient.post<{ url: string }>('/api/trpc/admin.orders.export', input)
      
      console.log('[Orders Service] Export response:', response)

      if (response.success && response.data) {
        return {
          success: true,
          message: 'Orders exported successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : 'Failed to export orders'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Orders Service] Export error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }
}

// Export singleton instance
export const ordersService = new OrdersService()

