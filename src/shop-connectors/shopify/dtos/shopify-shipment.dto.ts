import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyResources } from '../../../core/types/common.types'
import { ShopifyShipmentItemDto, ShopifyShipmentItemGraphQLDto } from './shopify-shipment-item.dto'

export class ShopifyShipmentDto {
  id?: number
  message?: string
  notify_customer?: boolean
  tracking_info: {
    number?: string
    url?: string
    company?: string
  }
  line_items_by_fulfillment_order: [
    {
      fulfillment_order_id: number
      fulfillment_order_line_items?: ShopifyShipmentItemDto[]
    }
  ]
}

export class ShopifyShipmentGraphQLDto {
  lineItemsByFulfillmentOrder: {
    fulfillmentOrderId: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
    fulfillmentOrderLineItems?: ShopifyShipmentItemGraphQLDto[]
  }
  notifyCustomer: boolean
  trackingInfo: {
    number: string
    company: string
    url: string
  }
}
