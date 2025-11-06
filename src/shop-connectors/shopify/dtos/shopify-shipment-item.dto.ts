import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyResources } from '../../../core/types/common.types'

export class ShopifyShipmentItemDto {
  id: number
  sku?: string
  quantity: number
}

export class ShopifyShipmentItemGraphQLDto {
  id: ShopifyGraphQLId<ShopifyResources.FulfillmentOrderLineItem>
  quantity: number
}
