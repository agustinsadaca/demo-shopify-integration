import { ShopifyGraphQLId } from '../../../core/types/common.types'
import {
  ShopifyDiscountAllocationDto,
  ShopifyDiscountAllocationGraphQLDto
} from './shopify-discount-allocation.dto'
import { ShopMoneyGraphQLDto } from './shopify-order.dto'
import { ShopifyTaxLinesDto, ShopifyTaxLinesGraphQLDto } from './shopify-tax-lines.dto'
import { ShopifyResources } from '../../../core/types/common.types'

export class ShopifyOrderItemDto {
  id?: number
  sku: string
  price: string
  quantity: number
  fulfillment_service: string
  tax_lines?: ShopifyTaxLinesDto[]
  discount_allocations?: ShopifyDiscountAllocationDto[]
}

export class ShopifyOrderItemGraphQLDto {
  id: ShopifyGraphQLId<ShopifyResources.LineItem> 
  sku: string
  originalUnitPriceSet: ShopMoneyGraphQLDto
  quantity: number
  taxLines: ShopifyTaxLinesGraphQLDto[]
  discountAllocations: ShopifyDiscountAllocationGraphQLDto[]
}
