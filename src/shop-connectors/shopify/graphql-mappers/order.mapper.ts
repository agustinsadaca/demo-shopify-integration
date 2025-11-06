import {
  CreateOrderDto,
  OrderHistory,
  OrderItem,
  TargetSystemEnum
} from '../../../core/types/common.types'
import { Logger } from '@nestjs/common'
import { ConnectionAuth } from '../../../connection-auths/entities/connection-auth.entity'
import { isEmpty } from '../../../core/utils/is-empty.utils'
import { NOT_PROVIDED } from '../../constants'
import { getShippingLastName, hasEnoughInformation } from '../../utils/orders.util'
import { PartialCompletedGraphQLDto } from '../dtos/partial-completed.dto'
import {
  ShopifyFulfillmentOrderGraphQLDto,
  ShopifyMerchantRequestsDto
} from '../dtos/shopify-fulfillment-order.dto'
import { ShopifyOrderGraphQLDto } from '../dtos/shopify-order.dto'
import { ShopifyShippingLineGraphQLDto } from '../dtos/shopify-shipping-line.dto'
import { OrderItemMapper } from './order-item.mapper'

export class OrderMapper {
  private static readonly logger = new Logger('ShopifyGraphQLOrderMapper')

  static calculateTaxAmount(grossAmount: number, taxRate: number): number | null {
    if (isEmpty(taxRate) || isEmpty(grossAmount)) return null
    return (taxRate * grossAmount) / (1 + taxRate)
  }

  static calculateShippingCosts(
    orderObj: CreateOrderDto,
    shippingLines: ShopifyShippingLineGraphQLDto[]
  ) {
    if (!shippingLines || shippingLines.length == 0) return

    const shippingLine = shippingLines[0]

    // TODO need to make changes. currently, Doing calculation as we are getting originalPriceSet.shopMoney.amount including tax

    orderObj.shippingCost = shippingLine?.discountedPriceSet?.shopMoney?.amount
      ? Number(shippingLine.discountedPriceSet.shopMoney.amount)
      : null
    orderObj.shippingTaxRate = null

    if (shippingLine?.taxLines?.length !== 0) {
      orderObj.shippingTaxRate = shippingLine?.taxLines?.[0]?.rate ?? null
    }

    if (!isEmpty(orderObj.shippingCost)) {
      orderObj.shippingTaxAmount = orderObj.shippingTaxRate
        ? this.calculateTaxAmount(orderObj.shippingCost, Number(orderObj.shippingTaxRate))
        : null
      orderObj.shippingCostNet = orderObj.shippingCost - orderObj.shippingTaxAmount
    }

    orderObj.shippingMethod = shippingLine?.code ?? null
  }

  public static mapFrom(
    fulfillmentOrder: ShopifyFulfillmentOrderGraphQLDto,
    extraParams: {
      implementationId?: number
      connection?: ConnectionAuth
      orderHistories?: OrderHistory[]
      partialCompletedFulfillmentIds: PartialCompletedGraphQLDto
      fulfillmentCountByExistingCustomerIds: Record<string, number>
      shopifyOrder: ShopifyOrderGraphQLDto
    } = {
        partialCompletedFulfillmentIds: undefined,
        fulfillmentCountByExistingCustomerIds: {},
        shopifyOrder: undefined
      }
  ): CreateOrderDto {
    const shopifyCompleteOrder = extraParams?.shopifyOrder
    const connectionAuth = extraParams?.connection
    const isTaxesIncluded = shopifyCompleteOrder.taxesIncluded
    let orderItemList: OrderItem[] = []
    let orderTotal = 0,
      orderTotalTaxRate = 0
    let orderDiscount = 0,
      orderDiscountNet = 0,
      orderDiscountTaxAmount = 0,
      orderDiscountTaxRate = 0

    const shopifyOrderId = shopifyCompleteOrder.legacyResourceId
    let customerOrderId = shopifyOrderId

    let isFirstFulfillmentOrder = true
    if (extraParams.fulfillmentCountByExistingCustomerIds[customerOrderId] > 0) {
      customerOrderId += `-${extraParams.fulfillmentCountByExistingCustomerIds[shopifyOrderId]}`
      extraParams.fulfillmentCountByExistingCustomerIds[shopifyOrderId] += 1
      isFirstFulfillmentOrder = false
    } else {
      extraParams.fulfillmentCountByExistingCustomerIds[shopifyOrderId] = 1
    }

    for (let orderItem of fulfillmentOrder.lineItems.nodes) {
      let item = OrderItemMapper.mapFrom(orderItem, {
        currency: shopifyCompleteOrder.currencyCode,
        isTaxesIncluded,
        shopifyOrder: shopifyCompleteOrder
      })

      if (item) {
        orderTotal += item.pricePaid

        orderTotalTaxRate += item.taxRate

        orderDiscount += item.discount
        orderDiscountTaxRate += item.discountTaxRate

        orderItemList.push(item)
      }
    }

    if (orderItemList.length === 0) {
      this.logger.error({
        message: 'Omitting order whose mapped orderItemList length is zero',
        shopifyOrder: JSON.stringify(fulfillmentOrder)
      })
      return null
    }

    const orderItemsLength = orderItemList.length
    orderTotalTaxRate = orderTotalTaxRate / orderItemsLength
    orderDiscountTaxRate = orderTotalTaxRate
    orderDiscountTaxAmount = this.calculateTaxAmount(orderDiscount, orderDiscountTaxRate)
    orderDiscountNet = orderDiscount - orderDiscountTaxAmount

    const shippingFirstName = shopifyCompleteOrder?.shippingAddress?.firstName
    const shippingLastName = shopifyCompleteOrder?.shippingAddress?.lastName
    const shippingCompanyName = shopifyCompleteOrder?.shippingAddress?.company

    const hasEnoughInfo = hasEnoughInformation(
      shippingFirstName,
      shippingLastName,
      shippingCompanyName
    )

    if (!hasEnoughInfo) {
      this.logger.error({
        message: 'Order is missing shippingFirstName, shippingLastName and shippingCompanyName',
        shopifyOrder: JSON.stringify(fulfillmentOrder)
      })
      return null
    }

    let orderObj: CreateOrderDto = {
      customerOrderId: customerOrderId,
      customerOrderNumber: shopifyCompleteOrder.name
        .replace(
          connectionAuth?.metaInfo?.shopifyOrderNumberFormat?.orderNumberFormatPrefix || '',
          ''
        )
        .replace(
          connectionAuth?.metaInfo?.shopifyOrderNumberFormat?.orderNumberFormatSuffix || '',
          ''
        ),
      channel: TargetSystemEnum.SHOPIFY,
      currency: shopifyCompleteOrder.currencyCode,
      shippingFirstName: shippingFirstName || shippingCompanyName || shippingLastName,
      shippingLastName: getShippingLastName(
        shippingFirstName,
        shippingLastName,
        shippingCompanyName
      ),
      shippingAddressLine1: shopifyCompleteOrder?.shippingAddress?.address1 || '',
      shippingAddressLine2: shopifyCompleteOrder?.shippingAddress?.address2,
      shippingCompanyName,
      shippingEmail: shopifyCompleteOrder?.customer?.defaultEmailAddress?.emailAddress,
      shippingZip: shopifyCompleteOrder?.shippingAddress?.zip || '',
      shippingCity: shopifyCompleteOrder?.shippingAddress?.city || '',
      shippingRegion: shopifyCompleteOrder?.shippingAddress?.province,
      shippingCountryCodeIso: shopifyCompleteOrder?.shippingAddress?.countryCodeV2 || '',
      shippingPhone: shopifyCompleteOrder?.shippingAddress?.phone,
      paymentMethod: shopifyCompleteOrder.paymentGatewayNames?.[0] ?? '',
      shippingMethod: shopifyCompleteOrder?.shippingLines?.nodes[0]?.code || NOT_PROVIDED,
      orderItems: orderItemList,
      implementationId: extraParams.implementationId || null,
      orderHistories: extraParams.orderHistories || null,
      placedAt: new Date(shopifyCompleteOrder.createdAt),
      billingFirstName: shopifyCompleteOrder?.billingAddress?.firstName || '',
      billingLastName: shopifyCompleteOrder?.billingAddress?.lastName || '',
      billingAddressLine1: shopifyCompleteOrder?.billingAddress?.address1 || '',
      billingAddressLine2: shopifyCompleteOrder?.billingAddress?.address2 || '',
      billingCompanyName: shopifyCompleteOrder?.billingAddress?.company || '',
      billingEmail: shopifyCompleteOrder?.billingAddress?.['email'] || '', // this field never exists
      billingZip: shopifyCompleteOrder?.billingAddress?.zip || '',
      billingCity: shopifyCompleteOrder?.billingAddress?.city || '',
      billingRegion: shopifyCompleteOrder?.billingAddress?.province || '',
      billingCountryCodeIso: shopifyCompleteOrder?.billingAddress?.countryCodeV2 || '',
      billingPhone: shopifyCompleteOrder?.billingAddress?.phone || ''
    }

    orderObj.shippingCost = null
    orderObj.shippingCostNet = null
    orderObj.shippingTaxAmount = null
    orderObj.shippingTaxRate = null

    this.calculateShippingCosts(orderObj, shopifyCompleteOrder.shippingLines.nodes)

    orderObj.discount = orderDiscount ?? null
    orderObj.discountNet = orderDiscountNet ?? null
    orderObj.discountTaxAmount = orderDiscountTaxAmount ?? null
    orderObj.discountTaxRate = orderDiscountTaxRate ?? null

    orderObj.total = orderTotal
    if (isFirstFulfillmentOrder) {
      orderObj.total += orderObj.shippingCost
    }
    orderObj.totalTaxRate = orderTotalTaxRate
    orderObj.totalTaxAmount = this.calculateTaxAmount(orderObj.total, orderObj.totalTaxRate)
    orderObj.totalNet = orderObj.total - orderObj.totalTaxAmount

    const fulfillmentOrderId = fulfillmentOrder.legacyResourceId
    const partialFulfillment: boolean =
      extraParams?.partialCompletedFulfillmentIds?.partialFulfilmentsOrderIds.includes(
        fulfillmentOrder.legacyResourceId
      )
    const CompletFulfillment: boolean =
      extraParams?.partialCompletedFulfillmentIds?.completedFulfilmentsOrderIds.includes(
        fulfillmentOrder.legacyResourceId
      )

    if (!isFirstFulfillmentOrder && partialFulfillment) {
      orderObj.shippingCost = 0
      orderObj.shippingCostNet = 0
      orderObj.shippingTaxAmount = 0
      orderObj.shippingTaxRate = 0
    }
    orderObj.metaInfo = {}
    if (fulfillmentOrderId) {
      orderObj.metaInfo.fulfillment_order_id = fulfillmentOrderId
      orderObj.metaInfo.shopify_fulfillment_order_gid = fulfillmentOrder.id
      orderObj.metaInfo.shopify_order_gid = fulfillmentOrder.orderId
      // TODO notify customer doesn't exists
      // orderObj.metaInfo.notifyCustomer = this.getNotifyCustomer(fulfillmentOrder.outgoing_requests)
    }
    if (CompletFulfillment) orderObj.metaInfo.fulfillment_orders_complete = true
    if (partialFulfillment) orderObj.metaInfo.partial_fulfillment = true

    orderObj.metaInfo.isManualShopOrder =
      shopifyCompleteOrder.sourceName === 'shopify_draft_order' ? true : false

    return orderObj
  }

  static getNotifyCustomer(fulfillmentIdMerchantRequests: ShopifyMerchantRequestsDto[]): boolean {
    let notify_customer: boolean = true

    if (fulfillmentIdMerchantRequests && fulfillmentIdMerchantRequests.length >= 1) {
      let request = fulfillmentIdMerchantRequests[0]
      notify_customer = request.request_options?.notify_customer
    }
    return notify_customer
  }
}
