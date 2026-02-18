/**
 * Orders API Types
 */

export interface MerchandiseItem {
  productId: string
  productName: string
  quantity: number
  price: number
  size?: string | null
  color?: string | null
}

export interface ApiOrder {
  _id: string
  id: string
  userId: string
  type: 'merchandise' | 'event' | 'other'
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
  merchandiseItems?: MerchandiseItem[]
  OrderNumber?: string
  stripePaymentIntentId?: string
  user?: {
    id: string | null
    firstName?: string
    lastName?: string
    email?: string
  }
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface Order {
  id: string
  orderId: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  type: 'merchandise' | 'event' | 'other'
  items: MerchandiseItem[]
  itemCount: number
  orderNumber?: string
  totalAmount: number
  status: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: string
  stripePaymentIntentId?: string
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface OrdersResponse {
  orders: Order[]
  pagination: Pagination
}

export interface GetOrdersParams {
  page?: number
  limit?: number
  search?: string
  type?: 'merchandise' | 'event' | 'other'
  status?: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
  dateFrom?: string
  dateTo?: string
}

export interface UpdateOrderData {
  orderId: string
  status?: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded'
  trackingNumber?: string
  notes?: string
}

