import {
  CalculateRefundOrderDto,
  CalculateRefundOrderResponseDto,
  OrderItem,
  RefundOrderItem
} from '../../../core/types/common.types'
import { ShopifyCalulateRefundDto } from '../dtos/shopify-calculate-refund.dto'
import {
  RefundLineItems,
  ShopifyCalculateRefundResponseDto
} from '../dtos/shopify-calulate-refund-response.dto'

export class RefundOrderMapper {
  public static mapTo(
    refundOrderDto: CalculateRefundOrderDto,
    extraParams: { orderItems: OrderItem[] }
  ): ShopifyCalulateRefundDto {
    const refundOrderItemObj = {}

    for (let orderItem of extraParams.orderItems) {
      refundOrderItemObj[orderItem.id] = orderItem.customerLineItemId
    }

    return {
      shipping: {
        full_refund: refundOrderDto.refundShipping,
      },
      refund_line_items: refundOrderDto.orderItems.map((item) => ({
        line_item_id: refundOrderItemObj[item.orderItemId] || item.customerLineItemId,
        quantity: item.quantity,
        restock_type: 'no_restock'
      }))
    }
  }

  public static mapFrom(shopifyCalulateRefundResponse: ShopifyCalculateRefundResponseDto, extraParams: { orderItems: OrderItem[], implementationId: number, orderId: number, returnShipmentId: number, lineItemIdToSkuMapping: Record<number, string> }): CalculateRefundOrderResponseDto {
    const refundOrderItemList = []
    const refundOrderItemObj = {}

    for (let orderItem of extraParams.orderItems) {
      refundOrderItemObj[orderItem.customerLineItemId] = orderItem.inventoryItemSku
    }

    for (let refundOrderItem of shopifyCalulateRefundResponse.refund_line_items) {
      const quantity = refundOrderItem.quantity
      const unitPrice = Number(refundOrderItem.price)
      const totalTax = Number(refundOrderItem.total_tax)

      const unitTax = totalTax / quantity

      const item = {
        quantity: quantity,
        unitPrice: unitPrice,
        unitTax: unitTax,
        total: Number(refundOrderItem.subtotal),
        totalTax: totalTax,
        sku: refundOrderItemObj[refundOrderItem.line_item_id] || extraParams?.lineItemIdToSkuMapping[refundOrderItem.line_item_id]
      }
      refundOrderItemList.push(item)
    }

    return {
      shopResponse: shopifyCalulateRefundResponse,
      refundOrder: {
        implementationId: extraParams.implementationId,
        orderId: extraParams.orderId,
        returnShipmentId: extraParams.returnShipmentId,
        shippingTotal: shopifyCalulateRefundResponse.shipping.amount && Number(shopifyCalulateRefundResponse.shipping.amount),
        shippingTotalTax: shopifyCalulateRefundResponse.shipping.tax && Number(shopifyCalulateRefundResponse.shipping.tax),
        total: Number(shopifyCalulateRefundResponse.transactions?.[0]?.amount),
        totalTax: this.calulateRefundOrderTotalTax(refundOrderItemList),
        lineItemsTotal: this.calulateRefundOrderLineItemsTotal(refundOrderItemList),
        discountTotal: this.calulateRefundOrderDiscountTotal(shopifyCalulateRefundResponse.refund_line_items),
        refundOrderItems: refundOrderItemList,
      }
    }
  }

  public static calulateRefundOrderTotalTax(refundOrderItemList: RefundOrderItem[]): number {
    return refundOrderItemList.reduce((acc, item) => {
      return acc + Number(item.totalTax)
    }, 0)
  }

  public static calulateRefundOrderDiscountTotal(refundOrderItemList: RefundLineItems[]): number {
    return refundOrderItemList.reduce((acc, item) => {
      return acc + Number(item.total_cart_discount_amount)
    }, 0)
  }

  public static calulateRefundOrderLineItemsTotal(refundOrderItemList: RefundOrderItem[]): number {
    return refundOrderItemList.reduce((acc, item) => {
      return acc + (Number(item.unitPrice) * Number(item.quantity))
    }, 0)
  }

  public static calulateRefundOrderLineItemsTotalTax(refundOrderItemList: RefundOrderItem[]): number {
    return refundOrderItemList.reduce((acc, item) => {
      return acc + (Number(item.unitTax) * Number(item.quantity))
    }, 0)
  }
}

