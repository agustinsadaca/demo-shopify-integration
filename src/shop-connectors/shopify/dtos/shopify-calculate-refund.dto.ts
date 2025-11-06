import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyRestockType } from '../enums/shopify-restock-type.enum'
export class ShopifyCalulateRefundDto {
  shipping: RefundShippingInfo
  refund_line_items: ShopifyRefundItemInfo[]
}

class RefundShippingInfo {
  full_refund: boolean
}

export class ShopifyRefundItemInfo {
  line_item_id: number
  quantity: number
  restock_type: string
}

export class ShopifyCalculateRefundGraphQLDto {
  shipping: {
    isRefundShipping: boolean
  }
  refundLineItems: ShopifyRefundItemInfoGraphQL[]
}

export class ShopifyRefundItemInfoGraphQL {
  lineItemId: ShopifyGraphQLId<'LineItem'>
  quantity: number
  restockType: ShopifyRestockType
}
