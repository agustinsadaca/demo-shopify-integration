import { OrderItem } from '../../../core/types/common.types'
import { Logger } from '@nestjs/common'
import { isNumber } from 'class-validator'
import { ShopifyDiscountAllocationDto } from '../dtos/shopify-discount-allocation.dto'
import { ShopifyFulfillmentOrderLineItemDto } from '../dtos/shopify-fulfillment-order-line-item.dto'
import { ShopifyOrderItemDto } from '../dtos/shopify-order-item.dto'
import { ShopifyOrderDto } from '../dtos/shopify-order.dto'

export class OrderItemMapper {
  public static mapFrom(
    fulfillmentOrderItem: ShopifyFulfillmentOrderLineItemDto,
    extraParams: { currency?: string; isTaxesIncluded: boolean; shopifyOrder: ShopifyOrderDto }
  ): OrderItem {
    const shopifyOrderLineItem = extraParams.shopifyOrder?.line_items?.find(
      (item) => item.id === fulfillmentOrderItem.line_item_id
    )
    if (
      !shopifyOrderLineItem?.sku ||
      !shopifyOrderLineItem.quantity ||
      !fulfillmentOrderItem.quantity
    ) {
      Logger.warn('omitting orderItem with no sku or quantity: ', fulfillmentOrderItem)
      return null
    }

    let pricePaid = null,
      pricePaidNet = null,
      unitPrice = null,
      unitPriceNet = null
    let discount = null,
      discountNet = null,
      discountTaxRate = null,
      discountTaxAmount = null,
      discountRate = null
    const quantity = fulfillmentOrderItem.quantity
    let taxAmount = shopifyOrderLineItem?.tax_lines?.[0]?.price
      ? Number(shopifyOrderLineItem?.tax_lines?.[0]?.price)
      : null
    const taxRate = shopifyOrderLineItem?.tax_lines?.[0]?.rate || 0

    const unitTaxAmount = isNumber(taxAmount)
      ? taxAmount / Number(shopifyOrderLineItem.quantity)
      : null
    taxAmount = unitTaxAmount * quantity
    if (extraParams.isTaxesIncluded) {
      unitPrice = Number(shopifyOrderLineItem.price)
      unitPriceNet = unitPrice - (unitTaxAmount ?? 0)
    } else {
      unitPriceNet = Number(shopifyOrderLineItem.price)
      unitPrice = unitPriceNet + (unitTaxAmount ?? 0)
    }

    discountTaxRate = taxRate
    if (
      shopifyOrderLineItem?.discount_allocations &&
      shopifyOrderLineItem?.discount_allocations?.length > 0
    ) {
      const discountAllocation: ShopifyDiscountAllocationDto =
        shopifyOrderLineItem?.discount_allocations[0]
      const unitDiscount = discountAllocation?.amount
        ? Number(discountAllocation?.amount) / Number(shopifyOrderLineItem.quantity)
        : null

      discountRate = unitDiscount ? unitDiscount / unitPrice : null
      discount = unitDiscount * quantity
      discountTaxAmount = discount && discountTaxRate ? discount * discountTaxRate : null
      discountNet = discount ? discount - discountTaxAmount : null
    }

    pricePaid = unitPrice * fulfillmentOrderItem.quantity - discount
    pricePaidNet = pricePaid - taxAmount

    let orderItemObj: OrderItem = {
      orderId: null,
      inventoryItemSku: shopifyOrderLineItem.sku,
      pricePaid,
      pricePaidNet,
      taxAmount,
      taxRate,
      unitPrice,
      unitPriceNet,
      quantity,
      discountRate,
      currency: (extraParams || {}).currency,
      order: undefined,
      inventoryItem: undefined,
      outboundShipmentItems: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      customerLineItemId: String(shopifyOrderLineItem.id),
      discount: discount,
      discountNet: discountNet,
      discountTaxAmount: discountTaxAmount,
      discountTaxRate: discountTaxRate
    }

    const fulfillmentOrderLineItemId: number = fulfillmentOrderItem.id
    if (fulfillmentOrderLineItemId) {
      orderItemObj.metaInfo = {}
      orderItemObj.metaInfo.fulfillment_order_line_item_id = fulfillmentOrderLineItemId.toString()
    }

    return orderItemObj
  }

  public static mapTo(
    orderItem: OrderItem,
    extraParams: { shippingMethod?: string }
  ): ShopifyOrderItemDto {
    return {
      sku: orderItem.inventoryItemSku,
      price: String(orderItem.pricePaid),
      quantity: orderItem.quantity,
      fulfillment_service: extraParams.shippingMethod || null
    }
  }
}
