
export class ShopifyPriceShippingRatesDto {
  price_based_shipping_rates?: ShopifyPriceShippingRatesItemDto[]
}

class ShopifyPriceShippingRatesItemDto {
  id?: number
  name?: string
  price?: String
}