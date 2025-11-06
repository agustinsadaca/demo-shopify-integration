import { OrderStatus } from '../enums/order-status.enum'

export class AggregationInfo {
  missingSKU?: number
  outOfStock?: number
  unknownShippingMethod?: number
  invalidAddress?: number
  notSyncedToWms?: number
  productsArchived?: number
}

export class OrdersAggregatedByStatusResponse {
  [OrderStatus.toBeFixed]?: number
  [OrderStatus.shipped]?: number
  [OrderStatus.new]?: number
  [OrderStatus.open]?: number
  [OrderStatus.cancelled]?: number
  [OrderStatus.waitingForFulfillment]?: number
  aggregationInfo?: AggregationInfo
}
