import { ShopifyGraphQLId } from '../dtos/shopify/shopify-graphql-id'
import { ShopifyResources } from '../enums/shopify-resources.enum'

export interface MetaInfoOrderItem {
  tax_rate_id?: string
  shopify_order_line_item_gid?: ShopifyGraphQLId<ShopifyResources.LineItem>
  fulfillment_order_line_item_id?: string
  shopify_fulfillment_order_line_item_gid?: ShopifyGraphQLId<ShopifyResources.FulfillmentOrderLineItem>
  shipped_quantity?: number
  parent_sku?: string
  ignores_shop_inventory_management?: boolean
}
