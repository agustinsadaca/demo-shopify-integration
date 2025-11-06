export interface CalculateRefundOrderDto {
  id?: number
  orderId: number
  customerOrderId?: string
  refundAmount: number
  refundReason?: string
  implementationId: number
  orderItems?: any[]
  returnShipmentId?: number
  isRefundRequired?: boolean
  metaInfo?: {
    [key: string]: any
  }
}

export interface CalculateRefundOrderResponseDto {
  id: number
  orderId: number
  customerOrderId: string
  refundAmount: number
  refundReason?: string
  implementationId: number
  status: string
  processedAt?: Date
  shopResponse?: any
  refundOrder?: any
  metaInfo?: {
    [key: string]: any
  }
}
