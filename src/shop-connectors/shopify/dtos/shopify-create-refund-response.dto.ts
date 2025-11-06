import { ShopifyGraphQLId } from '../../../core/types/common.types'
import {
  OrderAdjustment,
  RefundLineItems,
  TotalDutiesSet,
  Transaction
} from './shopify-calulate-refund-response.dto'

export class ShopifyCreateRefundResponseDto {
  refund: ShopifyRefundResponse
}

export class ShopifyRefundResponse {
  id: number
  order_id: number
  created_at: string
  note: string
  user_id: number
  processed_at: string
  restock: boolean
  duties: []
  total_duties_set: TotalDutiesSet
  additional_fees: []
  total_additional_fees_set: TotalDutiesSet
  admin_graphql_api_id: string
  refund_line_items: RefundLineItems[]
  transactions: Transaction[]
  order_adjustments: OrderAdjustment[]
}

export class ShopifyCreateRefundResponseGraphQLDto {
  id: ShopifyGraphQLId<'Refund'>
}
