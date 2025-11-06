export interface MetaInfoOrder {
  shopify_order_gid?: string
  partial_fulfillment?: boolean
  fulfillment_order_id?: string
  isShippingMethodUnknown?: boolean
  noAddressValidationReason?: string
  shopify_fulfillment_order_gid?: string
  [key: string]: any
}

export interface MetaInfoOrderItem {
  fulfillment_order_line_item_id?: string
  shopify_fulfillment_order_line_item_gid?: string
  shopify_order_line_item_gid?: string
  [key: string]: any
}

export interface OrderItem {
  id?: number
  orderId?: number
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
  order?: Order
  inventoryItem?: any
  outboundShipmentItems?: any
  createdAt?: Date
  updatedAt?: Date
  customerLineItemId: string
  discount?: number
  discountNet?: number
  discountTaxAmount?: number
  discountTaxRate: number
  metaInfo?: MetaInfoOrderItem
}

export interface Order {
  id?: number
  createdAt?: Date
  updatedAt?: Date
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
  orderItems?: OrderItem[]
  implementationId: number
  orderHistories?: any
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
