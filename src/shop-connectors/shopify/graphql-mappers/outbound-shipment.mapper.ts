import {
  Order,
  OrderItem,
  OutboundShipment,
  OutboundShipmentItem
} from '../../../core/types/common.types'
import { ShopifyShipmentItemGraphQLDto } from '../dtos/shopify-shipment-item.dto'
import { ShopifyShipmentGraphQLDto } from '../dtos/shopify-shipment.dto'
import { OutboundShipmentItemMapper } from './outbound-shipment-item.mapper'

export class OutboundShipmentMapper {
  private static getOutboundShipmentItemList(
    orderItems: OrderItem[],
    outboundShipmentItemSkuToQuantityMapping: Record<string, number>
  ): ShopifyShipmentItemGraphQLDto[] {
    let outboundShipmentItemList: ShopifyShipmentItemGraphQLDto[] = []

    for (const orderItem of orderItems || []) {
      const quantity: number = outboundShipmentItemSkuToQuantityMapping[orderItem.inventoryItemSku]
      const shippedQuantity: number = orderItem.metaInfo?.shipped_quantity || 0
      const canBeShipped: boolean =
        quantity !== undefined && quantity > 0 && shippedQuantity < orderItem.quantity

      if (canBeShipped) {
        if (!orderItem.metaInfo.shopify_fulfillment_order_line_item_gid) return []
        const quantityToBeConsidered = Math.min(orderItem.quantity - shippedQuantity, quantity)
        const outboundShipment = { quantity: quantityToBeConsidered } as OutboundShipmentItem
        let item = OutboundShipmentItemMapper.mapTo(outboundShipment, {
          customerShipmentItemGId: orderItem.metaInfo.shopify_fulfillment_order_line_item_gid
        })
        outboundShipmentItemSkuToQuantityMapping[orderItem.inventoryItemSku] =
          quantity - quantityToBeConsidered
        outboundShipmentItemList.push(item)
      }
    }

    return outboundShipmentItemList
  }

  public static mapTo(
    outboundShipment: OutboundShipment,
    params: {
      location_id: string
      outboundShipmentItemSkuToQuantityMapping: Record<string, number>
      order: Order
    }
  ): ShopifyShipmentGraphQLDto {
    let outboundShipmentItemList = OutboundShipmentMapper.getOutboundShipmentItemList(
      params.order.orderItems,
      params.outboundShipmentItemSkuToQuantityMapping
    )

    let notifyCustomer: boolean = true
    if (params.order?.metaInfo?.notifyCustomer === false) {
      notifyCustomer = false
    }

    const trackingUrl =
      outboundShipment?.carrier?.toLowerCase() === 'dhl'
        ? `https://nolp.dhl.de/nextt-online-public/set_identcodes.do?idc=${outboundShipment.trackingCode}`
        : null

    let result: ShopifyShipmentGraphQLDto = {
      notifyCustomer,
      trackingInfo: {
        number: outboundShipment.trackingCode,
        url: trackingUrl,
        company: outboundShipment.carrier
      },
      lineItemsByFulfillmentOrder: {
        fulfillmentOrderId: params.order.metaInfo.shopify_fulfillment_order_gid
      }
    }

    if (outboundShipmentItemList.length) {
      result.lineItemsByFulfillmentOrder.fulfillmentOrderLineItems = outboundShipmentItemList
    }
    return result
  }
}
