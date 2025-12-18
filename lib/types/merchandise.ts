/**
 * Merchandise/Products API Types
 */

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  availableForPurchase: boolean
  inStock: boolean
  stockQuantity: number
  sizes: string[]
  colors: string[]
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface MerchandiseStats {
  totalItems: number
  available: number
  inventoryValue: number
}

export interface MerchandiseResponse {
  products: Product[]
  pagination: Pagination
  stats: MerchandiseStats
}

export interface GetMerchandiseParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  availableForPurchase?: boolean
}

export interface CreateProductData {
  name: string
  description: string
  price: number | string
  category: string
  stockQuantity: number | string
  sizes?: string[]
  colors?: string[]
  availableForPurchase?: boolean
  inStock?: boolean
  images?: File[]
}

export interface UpdateProductData extends CreateProductData {
  id: string
}

