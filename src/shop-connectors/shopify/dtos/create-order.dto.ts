import { MetaInfoOrder, MetaInfoOrderItem } from '../entities/order.entity'

export interface CreateOrderItemDto {
  inventoryItemSku: string
  pricePaid: number
  pricePaidNet: number
  taxAmount: number
  taxRate: number
  unitPrice: number
  unitPriceNet: number
  quantity: number
  discountRate?: number
  currency: string
  customerLineItemId: string
  discount?: number
  discountNet?: number
  discountTaxAmount?: number
  discountTaxRate: number
  metaInfo?: MetaInfoOrderItem
}

export interface CreateOrderDto {
  customerOrderId: string
  customerOrderNumber: string
  channel: string
  currency: string
  shippingFirstName: string
  shippingLastName: string
  shippingAddressLine1: string
  shippingAddressLine2?: string
  shippingCompanyName?: string
  shippingEmail: string
  shippingZip: string
  shippingCity: string
  shippingRegion: string
  shippingCountryCodeIso: string
  shippingPhone?: string
  paymentMethod: string
  shippingMethod: string
  orderItems: CreateOrderItemDto[]
  implementationId: number
  placedAt: Date
  billingFirstName: string
  billingLastName: string
  billingAddressLine1: string
  billingAddressLine2?: string
  billingCompanyName?: string
  billingEmail?: string
  billingZip: string
  billingCity: string
  billingRegion: string
  billingCountryCodeIso: string
  billingPhone?: string
  shippingCost: number
  shippingCostNet: number
  shippingTaxAmount?: number
  shippingTaxRate?: number
  discount: number
  discountNet: number
  discountTaxAmount: number
  discountTaxRate: number
  total: number
  totalTaxRate: number
  totalTaxAmount: number
  totalNet: number
  metaInfo?: MetaInfoOrder
}
