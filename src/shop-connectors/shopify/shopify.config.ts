export class ShopifyConfigService {
  static apiVersion = '2025-04'
  private static SHOPIFY_ENDPOINT = {
    OrderListEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/orders.json`,
    OrderEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/orders`,
    ProductListEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/products.json`,
    ProductEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/products`,
    InventoryListEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/inventory_items.json`,
    InventoryEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/inventory_items`,
    InventoryLevelListEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/inventory_levels.json`,
    InventoryLevelEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/inventory_levels`,
    SetInventoryLevelEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/inventory_levels/set.json`,
    FulfillmentListEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/orders`,
    FulfillmentEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/fulfillments`,
    RefundListEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/orders`,
    RefundEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/orders`,
    AssignedFulfillmentOrders: `admin/api/${ShopifyConfigService.apiVersion}/assigned_fulfillment_orders.json`,
    FulfillmentOrderEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/fulfillment_orders`,
    ShopEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/shop.json`,
    FulfillmentServiceEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/fulfillment_services`,
    ShippingMethodsEndpoint: `admin/api/${ShopifyConfigService.apiVersion}/shipping_zones`,
    ExchangeOAuthCodeForToken: `admin/oauth/access_token`,
    GraphQL: `admin/api/${ShopifyConfigService.apiVersion}/graphql.json`
  }

  static getEndpoint(endpointKey: string): string {
    if (!(endpointKey in this.SHOPIFY_ENDPOINT))
      throw new Error(`${endpointKey} endpoint key doesn't exist`)
    return this.SHOPIFY_ENDPOINT[endpointKey]
  }
}

export const shopifyPlanRateLimitConfig = [
  {
    planDisplayName: 'Shopify Plus',
    allowedRequest: 20,
    ttlInSeconds: 1
  },
  {
    planDisplayName: 'Advanced',
    allowedRequest: 4,
    ttlInSeconds: 1
  }
]


// restoreRate is the max number of query points that can be restored per 1 second
export const shopifyGraphQLPlanRateLimitConfig = [
  {
    planDisplayName: 'Basic',
    restoreRate: 100
  },
  {
    planDisplayName: 'Shopify',
    restoreRate: 100
  },
  {
    planDisplayName: 'Advanced',
    restoreRate: 200
  },
  {
    planDisplayName: 'Shopify Plus',
    restoreRate: 1000
  },
  {
    planDisplayName: 'Enterprise',
    restoreRate: 2000
  }
]
