import { Order, OrderItem, OutboundShipment, OutboundShipmentItem } from '../../../core/types/common.types'
import { ShopifyShipmentItemDto } from '../dtos/shopify-shipment-item.dto'
import { ShopifyShipmentDto } from '../dtos/shopify-shipment.dto'
import { OutboundShipmentItemMapper } from './outbound-shipment-item.mapper'

export class OutboundShipmentMapper {
  private static getOutboundShipmentItemList(orderItems: OrderItem[], outboundShipmentItemSkuToQuantityMapping: Record<string, number>): ShopifyShipmentItemDto[] {
    let outboundShipmentItemList: ShopifyShipmentItemDto[] = []

    for (const orderItem of orderItems || []) {
      const quantity: number = outboundShipmentItemSkuToQuantityMapping[orderItem.inventoryItemSku]
      const shipped_quantity: number = orderItem.metaInfo?.shipped_quantity || 0
      const canBeShipped: boolean = quantity !== undefined && quantity > 0 && shipped_quantity < orderItem.quantity

      if (canBeShipped) {
        const quantityToBeConsidered = Math.min(orderItem.quantity - shipped_quantity, quantity)
        const outboundShipment = { quantity: quantityToBeConsidered } as OutboundShipmentItem
        let item = OutboundShipmentItemMapper.mapTo(outboundShipment, { customerShipmentItemId: orderItem.metaInfo.fulfillment_order_line_item_id })
        outboundShipmentItemSkuToQuantityMapping[orderItem.inventoryItemSku] = quantity - quantityToBeConsidered
        outboundShipmentItemList.push(item)
      }
    }

    return outboundShipmentItemList
  }

  public static mapTo(outboundShipment: OutboundShipment, params: { location_id: string, outboundShipmentItemSkuToQuantityMapping: Record<string, number>, order: Order }): ShopifyShipmentDto {
    let outboundShipmentItemList = OutboundShipmentMapper.getOutboundShipmentItemList(params.order.orderItems, params.outboundShipmentItemSkuToQuantityMapping)

    let notify_customer: boolean = true
    if (params.order?.metaInfo?.notifyCustomer === false) {
      notify_customer = false
    }

    const trackingUrl = outboundShipment?.carrier?.toLowerCase() === 'dhl' ? `https://nolp.dhl.de/nextt-online-public/set_identcodes.do?idc=${outboundShipment.trackingCode}` : null

    let result: ShopifyShipmentDto = {
      message: null,
      notify_customer: notify_customer,
      tracking_info: {
        number: outboundShipment.trackingCode,
        url: trackingUrl,
        company: outboundShipment.carrier
      },
      line_items_by_fulfillment_order: [{
        fulfillment_order_id: Number(params.order.metaInfo.fulfillment_order_id)
      }]
    }

    if (outboundShipmentItemList.length) {
      result.line_items_by_fulfillment_order.forEach((shipmentItem) => {
        shipmentItem.fulfillment_order_line_items = outboundShipmentItemList
      })
    }

    return result
  }
}