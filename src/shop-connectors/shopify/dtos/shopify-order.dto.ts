import { ShopifyGraphQLId } from '../../../core/types/common.types'
import {
  ShopifyBillingAddressDto,
  ShopifyBillingAddressGraphQLDto
} from './shopify-billing-address.dto'
import { ShopifyOrderItemDto, ShopifyOrderItemGraphQLDto } from './shopify-order-item.dto'
import { ShopifyPriceSetDto } from './shopify-price-set.dto'
import {
  ShopifyShippingAddressDto,
  ShopifyShippingAddressGraphQLDto
} from './shopify-shipping-address.dto'
import { ShopifyShippingLineDto, ShopifyShippingLineGraphQLDto } from './shopify-shipping-line.dto'
import { ShopifyTaxLinesDto, ShopifyTaxLinesGraphQLDto } from './shopify-tax-lines.dto'
import { ShopifyResources } from '../../../core/types/common.types'

export class ShopifyOrderDto {
  id: number
  order_number?: string
  total_price: string
  total_tax?: string
  currency: string
  shipping_address: ShopifyShippingAddressDto
  customer: { email: string }
  gateway: string
  payment_gateway_names?: string[]
  line_items: ShopifyOrderItemDto[]
  created_at?: string
  shipping_lines: ShopifyShippingLineDto[]
  billing_address: ShopifyBillingAddressDto
  taxes_included?: boolean
  total_discounts?: string
  total_shipping_price_set?: ShopifyPriceSetDto
  tax_lines?: ShopifyTaxLinesDto
  total_line_items_price?: string
  financial_status?: string
}

export class ShopifyOrderGraphQLDto {
  id: ShopifyGraphQLId<ShopifyResources.Order>
  legacyResourceId: string
  name: string
  sourceName: string
  totalPriceSet: ShopMoneyGraphQLDto
  totalTaxSet: ShopMoneyGraphQLDto
  currencyCode: string
  shippingAddress: ShopifyShippingAddressGraphQLDto
  customer: { defaultEmailAddress: { emailAddress: string } }
  paymentGatewayNames: string[]
  lineItems: { nodes: ShopifyOrderItemGraphQLDto[] }
  createdAt: string
  shippingLines: { nodes: ShopifyShippingLineGraphQLDto[] }
  billingAddress: ShopifyBillingAddressGraphQLDto
  taxesIncluded: boolean
  totalDiscountsSet: ShopMoneyGraphQLDto
  totalShippingPriceSet: ShopMoneyGraphQLDto
  taxLines: ShopifyTaxLinesGraphQLDto[]
  displayFinancialStatus: EShopifyOrderDisplayFinancialStatus
}

export class ShopMoneyGraphQLDto {
  shopMoney: { amount: string }
}

export enum EShopifyOrderDisplayFinancialStatus {
  AUTHORIZED = 'AUTHORIZED',
  EXPIRED = 'EXPIRED',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  PENDING = 'PENDING',
  REFUNDED = 'REFUNDED',
  VOIDED = 'VOIDED'
}
