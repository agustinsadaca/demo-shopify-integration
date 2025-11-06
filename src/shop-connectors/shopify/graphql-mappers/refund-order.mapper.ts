import {
  CalculateRefundOrderDto,
  CalculateRefundOrderResponseDto,
  OrderItem,
  RefundOrderItem
} from '../../../core/types/common.types'
import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyCalculateRefundGraphQLDto } from '../dtos/shopify-calculate-refund.dto'
import { ShopifyCalculateRefundResponseGraphQLDto } from '../dtos/shopify-calulate-refund-response.dto'

import { ShopifyResources } from '../../../core/types/common.types'
import { ShopifyRestockType } from '../enums/shopify-restock-type.enum'
import { GraphQlIdConverter } from '../mappers/graphql-id-converter.mapper'

export type RefundOrderMapperMapTo = {
  refundOrderDto: CalculateRefundOrderDto
  extraParams: { orderItems: OrderItem[] }
}

export type RefundOrderMapperMapFrom = {
  shopifyCalculateRefundResponse: ShopifyCalculateRefundResponseGraphQLDto
  extraParams: {
    orderItems: OrderItem[]
    implementationId: number
    orderId: number
    returnShipmentId: number
    lineItemIdToSkuMapping: Record<number, string>
  }
}

export class RefundOrderMapper {
  public static mapTo(
    refundOrderDto: RefundOrderMapperMapTo['refundOrderDto'],
    extraParams: RefundOrderMapperMapTo['extraParams']
  ): ShopifyCalculateRefundGraphQLDto {
    const refundOrderItemObj = {}

    for (let orderItem of extraParams.orderItems) {
      refundOrderItemObj[orderItem.id] = orderItem.customerLineItemId
    }

    return {
      shipping: {
        isRefundShipping: refundOrderDto.refundShipping
      },
      refundLineItems: refundOrderDto.orderItems.map((item) => {
        let lineItemId: string = refundOrderItemObj[item.orderItemId] || item.customerLineItemId

        if (!lineItemId.includes('gid://shopify/LineItem/')) {
          lineItemId = GraphQlIdConverter.convertToGraphqlId(lineItemId, ShopifyResources.LineItem)
        }

        const refundLineItem = {
          lineItemId: lineItemId as ShopifyGraphQLId<'LineItem'>,
          quantity: item.quantity,
          restockType: ShopifyRestockType.NO_RESTOCK
        }

        return refundLineItem
      })
    }
  }

  public static mapFrom(
    shopifyCalculateRefundResponse: RefundOrderMapperMapFrom['shopifyCalculateRefundResponse'],
    extraParams: RefundOrderMapperMapFrom['extraParams']
  ): CalculateRefundOrderResponseDto {
    const refundOrderItemList = []
    const refundOrderItemObj = {}

    for (let orderItem of extraParams.orderItems) {
      refundOrderItemObj[orderItem.customerLineItemId] = orderItem.inventoryItemSku
    }

    for (let refundOrderItem of shopifyCalculateRefundResponse.refundLineItems) {
      const quantity = refundOrderItem.quantity
      const unitPrice = Number(refundOrderItem.priceSet.shopMoney.amount)
      const totalTax = Number(refundOrderItem.totalTaxSet.shopMoney.amount)

      const unitTax = totalTax / quantity
      const numericLineItemId = refundOrderItem.lineItem.id.split('/').at(-1)

      const item = {
        quantity: quantity,
        unitPrice: unitPrice,
        unitTax: unitTax,
        total: Number(refundOrderItem.subtotalSet.shopMoney.amount),
        totalTax: totalTax,
        sku:
          refundOrderItemObj[numericLineItemId] ||
          extraParams?.lineItemIdToSkuMapping[numericLineItemId]
      }
      refundOrderItemList.push(item)
    }

    return {
      shopResponse: shopifyCalculateRefundResponse,
      refundOrder: {
        implementationId: extraParams.implementationId,
        orderId: extraParams.orderId,
        returnShipmentId: extraParams.returnShipmentId,
        shippingTotal:
          shopifyCalculateRefundResponse.shipping.amountSet.shopMoney.amount &&
          Number(shopifyCalculateRefundResponse.shipping.amountSet.shopMoney.amount),
        shippingTotalTax:
          shopifyCalculateRefundResponse.shipping.taxSet.shopMoney.amount &&
          Number(shopifyCalculateRefundResponse.shipping.taxSet.shopMoney.amount),
        total: Number(
          shopifyCalculateRefundResponse.suggestedTransactions?.[0]?.amountSet.shopMoney.amount
        ),
        totalTax: this.calculateRefundOrderTotalTax(refundOrderItemList),
        lineItemsTotal: this.calculateRefundOrderLineItemsTotal(refundOrderItemList),
        discountTotal: Number(
          shopifyCalculateRefundResponse.totalCartDiscountAmountSet.shopMoney.amount
        ),
        refundOrderItems: refundOrderItemList
      }
    }
  }

  public static calculateRefundOrderTotalTax(refundOrderItemList: RefundOrderItem[]): number {
    return refundOrderItemList.reduce((acc, item) => {
      return acc + Number(item.totalTax)
    }, 0)
  }

  public static calculateRefundOrderLineItemsTotal(refundOrderItemList: RefundOrderItem[]): number {
    return refundOrderItemList.reduce((acc, item) => {
      return acc + Number(item.unitPrice) * Number(item.quantity)
    }, 0)
  }
}
