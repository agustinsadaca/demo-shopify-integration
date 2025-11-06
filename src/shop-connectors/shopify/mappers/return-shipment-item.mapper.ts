import { ReturnShipmentItem } from '../../../core/types/common.types'
import { ShopifyRefundItemDto } from '../dtos/shopify-refund-item.dto'

export class ReturnShipmentItemMapper {
  public static mapFrom(
    shopifyRefundItem: ShopifyRefundItemDto,
    extraParams: { returnShipmentId: number, note: string, sku: string }
  ): ReturnShipmentItem {
    return {
      returnShipmentId: extraParams.returnShipmentId || null,
      inventoryItemSku: extraParams.sku,
      returnedQuantity: shopifyRefundItem.quantity,
      restockableQuantity: null,
      returnReason: extraParams.note || null,
      returnShipment: undefined,
      inventoryItem: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }
  }

  public static mapTo(returnShipmentItem: ReturnShipmentItem): ShopifyRefundItemDto {
    return {
      quantity: returnShipmentItem.returnedQuantity,
    }
  }
}