import { ShopifyRefundItemDto } from './shopify-refund-item.dto'

export class ShopifyRefundDto {
  note: string
  refund_line_items: ShopifyRefundItemDto[]
}