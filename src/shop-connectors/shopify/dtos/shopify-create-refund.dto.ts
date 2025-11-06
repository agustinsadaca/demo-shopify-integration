import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { SuggestedOrderTransactionKind } from '../enums/shopify-refund-kind.enum'
import { ShopifyRestockType } from '../enums/shopify-restock-type.enum'

export class ShopifyCreateRefundGraphQLDto {
  orderId: ShopifyGraphQLId<'Order'>
  refundLineItems: ShopifyRefundLineItemsGraphQL[]
  note?: string
  transactions: ShopifySuggestedTransaction[]
  notify?: boolean
}

class ShopifySuggestedTransaction {
  amount: string
  gateway: string
  kind: SuggestedOrderTransactionKind
  orderId: ShopifyGraphQLId<'Order'>
  parentId: ShopifyGraphQLId<'OrderTransaction'>
}

export class ShopifyRefundLineItemsGraphQL {
  lineItemId: ShopifyGraphQLId<'LineItem'>
  locationId: ShopifyGraphQLId<'Location'>
  quantity: number
  restockType: ShopifyRestockType
}
