/**
 * Merchandise/Products API Service
 * Handles all merchandise-related API calls
 */

import { apiClient } from './client'
import type { MerchandiseResponse, GetMerchandiseParams, CreateProductData, UpdateProductData, Product } from '../types/merchandise'

class MerchandiseService {
  private getBaseUrl(): string {
    return (process.env.NEXT_PUBLIC_API_URL || 'https://cantina-membership-app.vercel.app').replace(/\/$/, '')
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  }

  private extractUploadUrls(uploadData: any): string[] {
    if (!uploadData) return []
    if (Array.isArray(uploadData)) return uploadData
    if (Array.isArray(uploadData?.urls)) return uploadData.urls
    if (Array.isArray(uploadData?.data?.urls)) return uploadData.data.urls
    if (typeof uploadData?.url === 'string') return [uploadData.url]
    if (Array.isArray(uploadData?.data)) return uploadData.data
    if (Array.isArray(uploadData?.images)) return uploadData.images
    if (Array.isArray(uploadData?.data?.images)) return uploadData.data.images
    return []
  }

  private async uploadImages(images: File[]): Promise<{ success: boolean; urls?: string[]; error?: string; message?: string }> {
    try {
      const formData = new FormData()
      formData.append('type', 'product')
      images.forEach((file) => formData.append('images[]', file))

      const baseURL = this.getBaseUrl()
      const token = this.getAuthToken()

      const response = await fetch(`${baseURL}/api/upload/image`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')

      let uploadData: any
      try {
        uploadData = isJson ? await response.json() : await response.text()
      } catch (error) {
        throw new Error('Failed to parse upload response')
      }

      if (!response.ok) {
        const errorMessage =
          (isJson && uploadData?.error?.message) ||
          (isJson && uploadData?.error) ||
          (isJson && uploadData?.message) ||
          uploadData ||
          `HTTP error! status: ${response.status}`

        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
        }
      }

      const urls = this.extractUploadUrls(uploadData).filter((url): url is string => typeof url === 'string')

      if (!urls.length) {
        const errorMessage = 'No image URLs returned from upload'
        return { success: false, error: errorMessage, message: errorMessage }
      }

      return { success: true, urls }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while uploading images'
      console.error('[Merchandise Service] Upload images error:', error)
      return { success: false, error: errorMessage, message: errorMessage }
    }
  }

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
      let imageUrls: string[] = []

      if (data.images && data.images.length > 0) {
        const uploadResult = await this.uploadImages(data.images)
        if (!uploadResult.success || !uploadResult.urls) {
          const errorMessage = uploadResult.error || 'Failed to upload product images'
          return { success: false, error: errorMessage, message: errorMessage }
        }
        imageUrls = uploadResult.urls
      }

      const payload = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        category: data.category,
        stockQuantity: Number(data.stockQuantity),
        availableForPurchase: data.availableForPurchase ?? true,
        inStock: data.inStock ?? Number(data.stockQuantity) > 0,
        images: imageUrls,
        ...(data.sizes && data.sizes.length > 0 ? { sizes: data.sizes } : {}),
        ...(data.colors && data.colors.length > 0 ? { colors: data.colors } : {}),
      }

      const tRPCBody = { "0": { "json": payload } }

      console.log('[Merchandise Service] Creating product with payload:', payload)
      
      const response = await apiClient.post<Product>('/api/trpc/admin.merchandise.create', payload)

      return {
        success: !!response.success,
        data: response.data,
        error: response.error,
        message: response.message || (response.success ? 'Product created successfully' : response.error),
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
      let imageUrls: string[] = []

      if (data.images && data.images.length > 0) {
        const uploadResult = await this.uploadImages(data.images)
        if (!uploadResult.success || !uploadResult.urls) {
          const errorMessage = uploadResult.error || 'Failed to upload product images'
          return { success: false, error: errorMessage, message: errorMessage }
        }
        imageUrls = uploadResult.urls
      }

      const payload = {
        productId: data.id,
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        category: data.category,
        stockQuantity: Number(data.stockQuantity),
        availableForPurchase: data.availableForPurchase ?? true,
        inStock: data.inStock ?? Number(data.stockQuantity) > 0,
        ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
        ...(data.sizes && data.sizes.length > 0 ? { sizes: data.sizes } : {}),
        ...(data.colors && data.colors.length > 0 ? { colors: data.colors } : {}),
      }

      const tRPCBody = { "0": { "json": payload } }

      console.log('[Merchandise Service] Updating product with payload:', payload)
      
      const response = await apiClient.post<Product>('/api/trpc/admin.merchandise.update', payload)

      return {
        success: !!response.success,
        data: response.data,
        error: response.error,
        message: response.message || (response.success ? 'Product updated successfully' : response.error),
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

