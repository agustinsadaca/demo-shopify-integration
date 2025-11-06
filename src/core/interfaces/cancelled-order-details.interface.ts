import { ShopifyGraphQLId, ShopifyResources } from '../types/common.types'

export interface CancelledOrderDetails {
  fulfillmentOrderId: string
  shopifyFulfillmentOrderGId?: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
  shopifyOrderGId?: ShopifyGraphQLId<ShopifyResources.Order>
  isManualOrder: boolean
  orderId: number
  customerOrderId: string
  implementationId: number
  orderDeliveryId: string
}
