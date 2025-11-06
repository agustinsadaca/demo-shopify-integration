import {
  CalculateRefundOrderResponseDto,
  Order,
  OrderItem,
  RefundOrderItem
} from '../../core/types/common.types'

export class RefundOrderMapper {
  public static mapFrom(
    returnOrderItems: Partial<OrderItem>[],
    extraParams: {
      orderItemsByIdHash: { [key: string]: OrderItem },
      order: Order,
      totalOrderItemQuantity: number,
      returnShipmentId: number,
      refundShipping: boolean
    },
  ): CalculateRefundOrderResponseDto {
    const order = extraParams.order
    const orderItemsByIdHash = extraParams.orderItemsByIdHash
    let totalLineItemQuantity: number = 0

    const lineItemsTotal = returnOrderItems.reduce((accu, returnOrderItem: OrderItem) => {
      accu += returnOrderItem.quantity * Number(returnOrderItem.unitPrice)

      return accu
    }, 0)

    const refundOrderItems = returnOrderItems.map((returnOrderItem) => {
      const orderItemTotalQuantity = orderItemsByIdHash[returnOrderItem.id].quantity
      const unitTax = returnOrderItem.taxAmount / orderItemTotalQuantity
      totalLineItemQuantity += returnOrderItem.quantity

      return <RefundOrderItem>{
        id: returnOrderItem.id,
        sku: returnOrderItem.inventoryItemSku,
        unitPrice: Number(returnOrderItem.unitPrice),
        unitTax: unitTax,
        totalTax: unitTax * returnOrderItem.quantity,
        total: Number(returnOrderItem.unitPrice) * returnOrderItem.quantity,
        skuImplementation: returnOrderItem.inventoryItemSkuImplementation,
        quantity: returnOrderItem.quantity,
      }
    })

    const lineItemsTotalTax = returnOrderItems.reduce((accu, returnOrderItem: OrderItem) => {
      accu += Number(returnOrderItem.taxAmount)

      return accu
    }, 0)

    const unitDiscount = Number(order.discount) / extraParams.totalOrderItemQuantity
    const discountTotal = unitDiscount * totalLineItemQuantity
    const shippingTotal = Number(order.shippingCost)
    let total = Number(order.total)

    if (!extraParams.refundShipping) {
      total = total - shippingTotal
    }

    return {
      shopResponse: {},
      refundOrder: {
        orderId: order.id,
        implementationId: order.implementationId,
        returnShipmentId: extraParams.returnShipmentId,
        lineItemsTotal: lineItemsTotal,
        lineItemsTotalTax: lineItemsTotalTax,
        shippingTotal: shippingTotal,
        shippingTotalTax: Number(order.shippingTaxAmount),
        discountTotal: discountTotal,
        totalTax: Number(order.totalTaxAmount),
        total: total,
        refundOrderItems: refundOrderItems
      }
    }

  }
}

