import { ShopMoneyGraphQLDto } from './shopify-order.dto'

export class ShopifyTaxLinesDto {
  rate: number
  price: string
}

export class ShopifyTaxLinesGraphQLDto {
  rate: number
  priceSet: ShopMoneyGraphQLDto
}
