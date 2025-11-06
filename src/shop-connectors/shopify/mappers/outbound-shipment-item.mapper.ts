import { OutboundShipmentItem } from '../../../core/types/common.types'
import { ShopifyShipmentItemDto } from '../dtos/shopify-shipment-item.dto'

export class OutboundShipmentItemMapper {
  public static mapFrom(shopifyShipmentItem: ShopifyShipmentItemDto, extraParams: { outboundShipmentId?: number }): OutboundShipmentItem {
    return {
      outboundShipmentId: extraParams.outboundShipmentId,
      orderItemSku: shopifyShipmentItem.sku,
      quantity: shopifyShipmentItem.quantity,
      outboundShipment: undefined,
      orderItem: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }
  }

  public static mapTo(outboundShipmentItem: OutboundShipmentItem, params: { customerShipmentItemId }): ShopifyShipmentItemDto {
    return {
      id: +params.customerShipmentItemId,
      quantity: outboundShipmentItem.quantity,
    }
  }
}