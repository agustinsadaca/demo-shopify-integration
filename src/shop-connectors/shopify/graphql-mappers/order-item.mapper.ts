import { OrderItem } from '../../../core/types/common.types'
import { Logger } from '@nestjs/common'
import { isNumber } from 'class-validator'
import { ShopifyDiscountAllocationGraphQLDto } from '../dtos/shopify-discount-allocation.dto'
import { ShopifyFulfillmentOrderLineItemGraphQLDto } from '../dtos/shopify-fulfillment-order-line-item.dto'
import { ShopifyOrderGraphQLDto } from '../dtos/shopify-order.dto'
import { GraphQlIdConverter } from '../mappers/graphql-id-converter.mapper'

export class OrderItemMapper {
  public static mapFrom(
    fulfillmentOrderItem: ShopifyFulfillmentOrderLineItemGraphQLDto,
    extraParams: {
      currency?: string
      isTaxesIncluded: boolean
      shopifyOrder: ShopifyOrderGraphQLDto
    }
  ): OrderItem {
    const shopifyOrderLineItem = extraParams.shopifyOrder?.lineItems.nodes?.find(
      (item) => item.id === fulfillmentOrderItem.lineItem.id
    )
    if (
      !shopifyOrderLineItem?.sku ||
      !shopifyOrderLineItem.quantity ||
      !fulfillmentOrderItem.totalQuantity
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
    const quantity = fulfillmentOrderItem.totalQuantity
    let taxAmount = shopifyOrderLineItem?.taxLines?.[0]?.priceSet?.shopMoney?.amount // TODO why we were considering only first tax line?
      ? Number(shopifyOrderLineItem?.taxLines?.[0]?.priceSet?.shopMoney?.amount)
      : null
    const taxRate = shopifyOrderLineItem?.taxLines?.[0]?.rate || 0

    const unitTaxAmount = isNumber(taxAmount)
      ? taxAmount / Number(shopifyOrderLineItem.quantity)
      : null
    taxAmount = unitTaxAmount * quantity

    // TODO after confirmation of tax calculation remove below part of comments
    // if (extraParams.isTaxesIncluded) { // this condition is not making any sense as taxinxcluded is not for unit price
    unitPrice = Number(shopifyOrderLineItem.originalUnitPriceSet.shopMoney.amount) // this price always includes tax
    unitPriceNet = unitPrice - (unitTaxAmount ?? 0)
    // } else {
    //   unitPriceNet = Number(shopifyOrderLineItem.originalUnitPriceSet.shopMoney.amount)
    //   unitPrice = unitPriceNet + (unitTaxAmount ?? 0)
    // }

    discountTaxRate = taxRate
    if (shopifyOrderLineItem?.discountAllocations?.length > 0) {
      const discountAllocation: ShopifyDiscountAllocationGraphQLDto =
        shopifyOrderLineItem?.discountAllocations[0]

      const unitDiscount = discountAllocation?.allocatedAmountSet?.shopMoney.amount
        ? Number(discountAllocation?.allocatedAmountSet?.shopMoney.amount) /
        Number(shopifyOrderLineItem.quantity)
        : null

      discountRate = unitDiscount ? unitDiscount / unitPrice : null
      discount = unitDiscount * quantity
      discountTaxAmount = discount && discountTaxRate ? discount * discountTaxRate : null
      discountNet = discount ? discount - discountTaxAmount : null
    }

    pricePaid = unitPrice * fulfillmentOrderItem.totalQuantity - discount
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
      currency: extraParams?.currency,
      order: undefined,
      inventoryItem: undefined,
      outboundShipmentItems: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      customerLineItemId: GraphQlIdConverter.convertFromGraphqlId(shopifyOrderLineItem.id),
      discount: discount,
      discountNet: discountNet,
      discountTaxAmount: discountTaxAmount,
      discountTaxRate: discountTaxRate
    }

    const fulfillmentOrderLineItemId = GraphQlIdConverter.convertFromGraphqlId(
      fulfillmentOrderItem.id
    )
    orderItemObj.metaInfo = {}
    if (fulfillmentOrderLineItemId) {
      orderItemObj.metaInfo.fulfillment_order_line_item_id = fulfillmentOrderLineItemId
      orderItemObj.metaInfo.shopify_fulfillment_order_line_item_gid = fulfillmentOrderItem.id
    }
    if (!fulfillmentOrderItem?.variant?.inventoryItem?.tracked) {
      orderItemObj.metaInfo.ignores_shop_inventory_management = true
    }
    orderItemObj.metaInfo.shopify_order_line_item_gid = shopifyOrderLineItem.id
    return orderItemObj
  }
}
