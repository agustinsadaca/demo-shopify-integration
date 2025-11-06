import { ShopMoneyGraphQLDto } from './shopify-order.dto'

export class ShopifyDiscountAllocationDto {
  amount: string
}

export class ShopifyDiscountAllocationGraphQLDto {
  allocatedAmountSet: ShopMoneyGraphQLDto
}
