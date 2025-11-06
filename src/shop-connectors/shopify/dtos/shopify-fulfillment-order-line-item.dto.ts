import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyResources } from '../../../core/types/common.types'

export class ShopifyFulfillmentOrderLineItemDto {
  id: number
  shop_id: number
  fulfillment_order_id: number
  quantity: number
  line_item_id: number
  inventory_item_id: number
  fulfillable_quantity: number
  variant_id: number
}

export class ShopifyFulfillmentOrderLineItemGraphQLDto {
  id: ShopifyGraphQLId<ShopifyResources.FulfillmentOrderLineItem>
  totalQuantity: number
  lineItem: {
    id: ShopifyGraphQLId<ShopifyResources.LineItem>
  }
  inventoryItemId: string
  variant: {
    id: string
    legacyResourceId: string
    inventoryItem: {
      tracked: boolean
    }
  }
}
