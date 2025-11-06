export interface PutOrderGidDto {
  orderId?: number
  customerOrderId?: string
  fulfillmentOrderId?: string
  shopifyOrderGid?: string
  implementationId: number
  orderMetaInfo?: {
    shopify_order_gid?: string
    shopify_fulfillment_order_gid?: string
    [key: string]: any
  }
  orderItemsInfo?: any[]
}
