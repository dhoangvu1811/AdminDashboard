export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'ZALOPAY'

export type VoucherType = 'PERCENTAGE' | 'FIXED'

export interface OrderItem {
  productId: string
  name: string
  image: string
  unitPrice: number
  discount: number
  quantity: number
  lineTotal: number
  sku?: string // Frontend specific? kept for now
}

export interface ShippingAddress {
  id?: string | number
  name: string
  phone: string
  address: string
  city: string
  province: string
  postalCode?: string
  isDefault?: boolean
  fullName?: string // Admin dashboard uses fullName in some places? Accessor fix needed if mismatched.
  // Backend uses 'name' in ShippingAddress interface but 'fullName' in DB model.
  // MapOrderToApi in Service maps: name: order.shippingAddress?.fullName || '',
  // So 'name' is the correct API field.
}

export interface OrderVoucher {
  voucherId?: string | number
  code: string
  type: VoucherType
  amount: number
  maxDiscount?: number
  discountApplied: number
}

export interface OrderTotals {
  subtotal: number
  discount: number
  shippingFee: number
  payable: number
}

export interface LogEntry {
  id?: number
  action: string
  performedById?: number | null
  performedByRole?: 'user' | 'admin' | 'system' | null
  at: Date | string
  note?: string | null
  fromStatus?: OrderStatus | null
  toStatus?: OrderStatus | null
  fromPaymentStatus?: PaymentStatus | null
  toPaymentStatus?: PaymentStatus | null
  meta?: any

  // Populated info
  performedBy?: {
    _id: number
    displayName: string
    role: string
  }
}

export type OrderLog = LogEntry // Alias for backward compatibility if needed

export interface Payment {
  id: number
  orderId: number
  paymentMethod: PaymentMethod
  transactionId?: string | null
  value: number
  status: PaymentStatus
  paidAt?: Date | string | null
  createdAt: Date | string
}

export interface Order {
  id: number
  _id?: string | number
  userId: number
  orderCode: string

  items: OrderItem[]
  shippingAddress: ShippingAddress
  vouchers?: OrderVoucher[]
  totals: OrderTotals

  status: OrderStatus
  paymentStatus?: PaymentStatus
  payments: Payment[]
  logs: LogEntry[]

  deliveredAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string

  user?: {
    id: number
    name: string
    email: string
    role: { id: number; name: string } | string
  }
}

export interface OrderListResponse {
  code: number
  message: string
  data: {
    orders: Order[]
    pagination: {
      page: number
      itemsPerPage: number
      total: number
      totalPages: number
    }
  }
}

export interface OrderFilters {
  page?: number
  itemsPerPage?: number
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  search?: string
  startDate?: string
  endDate?: string
}
