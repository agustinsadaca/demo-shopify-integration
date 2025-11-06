export interface OutboundShipment {
  id?: number
  createdAt?: Date
  updatedAt?: Date
  customerShipmentId?: string
  implementationId: number
  orderId?: number
  trackingNumber?: string
  carrier?: string
  shippingMethod?: string
  shippedAt?: Date
  deliveredAt?: Date
  status?: string
  metaInfo?: {
    [key: string]: any
  }
}
