/**
 * Merchandise/Products API Service
 * Handles all merchandise-related API calls
 */

import { apiClient } from './client'
import type { MerchandiseResponse, GetMerchandiseParams, CreateProductData, UpdateProductData, Product } from '../types/merchandise'

class MerchandiseService {
  /**
   * Get all products with pagination
   */
  async getAllProducts(params?: GetMerchandiseParams): Promise<{ success: boolean; data?: MerchandiseResponse; error?: string; message?: string }> {
    try {
      // Build input with defaults as per API requirements
      const input: Record<string, any> = {
        page: params?.page || 1, // Default to 1
        limit: params?.limit || 20, // Default to 20
      }
      
      // Add optional parameters
      if (params?.search) {
        input.search = params.search
      }
      if (params?.category) {
        input.category = params.category
      }
      if (params?.availableForPurchase !== undefined) {
        input.availableForPurchase = params.availableForPurchase
      }

      console.log('[Merchandise Service] Fetching products with params:', input)
      
      // tRPC POST format: { "0": { "json": input } }
      const tRPCBody = { "0": { "json": input } }
      
      console.log('[Merchandise Service] POST Body:', JSON.stringify(tRPCBody, null, 2))
      
      const response = await apiClient.post<MerchandiseResponse>('/api/trpc/admin.merchandise.getAll', tRPCBody)
      
      console.log('[Merchandise Service] API Response:', response)

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Products fetched successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : typeof response.error === 'object' && (response.error as any)?.message
        ? (response.error as any).message
        : typeof response.message === 'string'
        ? response.message
        : 'Failed to fetch products'

      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Merchandise Service] Error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const tRPCBody = { "0": { "json": { id: productId } } }
      const response = await apiClient.post(`/api/trpc/admin.merchandise.getById`, tRPCBody)
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        }
      }

      return {
        success: false,
        error: response.error || 'Failed to fetch product',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }
    }
  }

  /**
   * Create new product with FormData (for file uploads)
   */
  async createProduct(data: CreateProductData): Promise<{ success: boolean; data?: Product; error?: string; message?: string }> {
    try {
      const formData = new FormData()
      
      // Add text fields
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('price', String(data.price))
      formData.append('category', data.category)
      formData.append('stockQuantity', String(data.stockQuantity))
      
      // Add optional fields
      if (data.availableForPurchase !== undefined) {
        formData.append('availableForPurchase', String(data.availableForPurchase))
      }
      if (data.inStock !== undefined) {
        formData.append('inStock', String(data.inStock))
      }
      
      // Add sizes (array)
      if (data.sizes && data.sizes.length > 0) {
        data.sizes.forEach(size => {
          formData.append('sizes', size)
        })
      }
      
      // Add colors (array)
      if (data.colors && data.colors.length > 0) {
        data.colors.forEach(color => {
          formData.append('colors', color)
        })
      }
      
      // Add images (array)
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images[]', image)
        })
      }

      console.log('[Merchandise Service] Creating product with FormData')
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://cantina-membership-app.vercel.app/'
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      
      const response = await fetch(`${baseURL}api/api/admin/products/create`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData,
      })

      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')
      
      let responseData: any
      try {
        responseData = isJson ? await response.json() : await response.text()
      } catch (error) {
        throw new Error('Failed to parse response')
      }

      if (!response.ok) {
        const errorMessage = 
          (isJson && responseData?.error?.message) || 
          (isJson && responseData?.error) || 
          (isJson && responseData?.message) ||
          responseData || 
          `HTTP error! status: ${response.status}`
        
        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
        }
      }

      // Handle REST API response format
      let productData = responseData
      if (isJson && responseData?.data) {
        productData = responseData.data
      } else if (isJson && responseData) {
        productData = responseData
      }

      return {
        success: true,
        data: productData as Product,
        message: 'Product created successfully',
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Merchandise Service] Create product error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Update product with FormData (for file uploads)
   */
  async updateProduct(data: UpdateProductData): Promise<{ success: boolean; data?: Product; error?: string; message?: string }> {
    try {
      const formData = new FormData()
      
      // Add ID
      formData.append('productId', data.id)
      
      // Add text fields
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('price', String(data.price))
      formData.append('category', data.category)
      formData.append('stockQuantity', String(data.stockQuantity))
      
      // Add optional fields
      if (data.availableForPurchase !== undefined) {
        formData.append('availableForPurchase', String(data.availableForPurchase))
      }
      if (data.inStock !== undefined) {
        formData.append('inStock', String(data.inStock))
      }
      
      // Add sizes (array)
      if (data.sizes && data.sizes.length > 0) {
        data.sizes.forEach(size => {
          formData.append('sizes', size)
        })
      }
      
      // Add colors (array)
      if (data.colors && data.colors.length > 0) {
        data.colors.forEach(color => {
          formData.append('colors', color)
        })
      }
      
      // Add existing images (URLs to keep)
      if (data.existingImages && data.existingImages.length > 0) {
        data.existingImages.forEach((imageUrl) => {
          formData.append('existingImages[]', imageUrl)
        })
      }
      
      // Add images (array) - only new images
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images[]', image)
        })
      }

      console.log('[Merchandise Service] Updating product with FormData')
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://cantina-membership-app.vercel.app/'
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      
      const response = await fetch(`${baseURL}api/api/admin/products/update`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData,
      })

      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')
      
      let responseData: any
      try {
        responseData = isJson ? await response.json() : await response.text()
      } catch (error) {
        throw new Error('Failed to parse response')
      }

      if (!response.ok) {
        const errorMessage = 
          (isJson && responseData?.error?.message) || 
          (isJson && responseData?.error) || 
          (isJson && responseData?.message) ||
          responseData || 
          `HTTP error! status: ${response.status}`
        
        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
        }
      }

      // Handle REST API response format
      let productData = responseData
      if (isJson && responseData?.data) {
        productData = responseData.data
      } else if (isJson && responseData) {
        productData = responseData
      }

      return {
        success: true,
        data: productData as Product,
        message: 'Product updated successfully',
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Merchandise Service] Update product error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(productId: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      // tRPC POST format: { "0": { "json": { productId } } }
      const tRPCBody = {   productId   }
      const response = await apiClient.post<{ message?: string }>(`/api/trpc/admin.merchandise.delete`, tRPCBody)

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Product deleted successfully',
        }
      }

      const errorMessage = response.error || 'Failed to delete product'
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Merchandise Service] Delete product error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }
}

// Export singleton instance
export const merchandiseService = new MerchandiseService()

