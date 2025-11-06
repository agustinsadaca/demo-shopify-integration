import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { SuggestedOrderTransactionKind } from '../enums/shopify-refund-kind.enum'
import { ShopifyRestockType } from '../enums/shopify-restock-type.enum'

export class ShopifyCalculateRefundResponseDto {
  shipping: Shipping
  duties: []
  total_duties_set: TotalDutiesSet
  additional_fees: []
  total_additional_fees_set: TotalDutiesSet
  refund_line_items: RefundLineItems[]
  transactions: Transaction[]
  currency: string
}

class Shipping {
  amount: string
  tax: string
  maximum_refundable: string
}

export class TotalDutiesSet {
  shop_money: { amount: string; currency_code: string }
  presentment_money: { amount: string; currency_code: string }
}

export class RefundLineItems {
  quantity: number
  line_item_id: number
  location_id: number
  restock_type: string
  price: string
  subtotal: string
  total_tax: string
  discounted_price: string
  discounted_total_price: string
  total_cart_discount_amount: string
}

export class Transaction {
  id?: number
  order_id: number
  kind: string
  gateway: string
  parent_id: number
  amount: string
  currency: string
  maximum_refundable: string
  status?: string
  message?: string
  created_at?: string
  test?: boolean
  location_id?: number
  user_id?: number
  processed_at?: string
  source_name?: string
  receipt?: {}
  payment_id?: string
  admin_graphql_api_id?: string
}
export class OrderAdjustment {
  id: number
  order_id: number
  refund_id: number
  amount: string
  tax_amount: string
  kind: string
  reason: string
  amount_set: TotalDutiesSet
  tax_amount_set: TotalDutiesSet
}

export class ShopifyCalculateRefundResponseGraphQLDto {
  shipping: ShippingGraphQl
  suggestedTransactions: ShopifySuggestedTransaction[]
  refundLineItems: ShopifyRefundLineItemsGraphQL[]
  totalCartDiscountAmountSet: ShopifyMoneyBag
}

class ShippingGraphQl {
  amountSet: ShopifyMoneyBag
  taxSet: ShopifyMoneyBag
}

class ShopifyMoneyBag {
  shopMoney: ShopifyMoney
  presentmentMoney: ShopifyMoney
}

class ShopifyMoney {
  amount: string
  currencyCode: string
}

class ShopifySuggestedTransaction {
  amountSet: ShopifyMoneyBag
  gateway: string
  kind: SuggestedOrderTransactionKind
  parentTransaction: ShopifyParentTransaction
}

class ShopifyParentTransaction {
  id: ShopifyGraphQLId<'OrderTransaction'>
}

export class ShopifyRefundLineItemsGraphQL {
  lineItem: ShopifyLineItem
  location: ShopifyLocation | null
  priceSet: ShopifyMoneyBag
  quantity: number
  restockType: ShopifyRestockType
  subtotalSet: ShopifyMoneyBag
  totalTaxSet: ShopifyMoneyBag
}

class ShopifyLineItem {
  id: ShopifyGraphQLId<'LineItem'>
}

class ShopifyLocation {
  id: ShopifyGraphQLId<'Location'>
}
