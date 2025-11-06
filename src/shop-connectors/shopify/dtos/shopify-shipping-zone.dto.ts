import { ShopifyPriceShippingRatesDto } from './shopify-price-shipping-rates'

export class ShopifyShippingZoneDto {
  shipping_zones?: ShopifyPriceShippingRatesDto[]
}

export class ShopifyShippingZoneGraphQLDto {
  profileLocationGroups?: {
    locationGroupZones?: {
      nodes: {
        methodDefinitions?: {
          nodes: {
            id: string
            name: string
          }[]
        }
      }[]
    }
  }[]
}
