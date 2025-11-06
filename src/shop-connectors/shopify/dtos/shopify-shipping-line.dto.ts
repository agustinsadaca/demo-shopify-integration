import { ShopMoneyGraphQLDto } from './shopify-order.dto'
import { ShopifyTaxLinesDto, ShopifyTaxLinesGraphQLDto } from './shopify-tax-lines.dto'

export class ShopifyShippingLineDto {
  code: string
  price: string
  tax_lines?: ShopifyTaxLinesDto[]
  requested_fulfillment_service_id: string
}

export class ShopifyShippingLineGraphQLDto {
  code: string
  taxLines: ShopifyTaxLinesGraphQLDto[]
  discountedPriceSet: ShopMoneyGraphQLDto
}