export enum ShopifyResources {
  Order = 'Order',
  FulfillmentOrder = 'FulfillmentOrder',
  InventoryItem = 'InventoryItem',
  InventoryLevel = 'InventoryLevel',
  Location = 'Location',
  Product = 'Product',
  ProductVariant = 'ProductVariant',
  LineItem = 'LineItem',
  FulfillmentOrderLineItem = 'FulfillmentOrderLineItem'
}

// Allow string literals for backward compatibility
export type ShopifyResourceString = ShopifyResources | 'Order' | 'Location'

export type ShopifyGraphQLId<T extends ShopifyResources | string> = `gid://shopify/${T}/${string}`
