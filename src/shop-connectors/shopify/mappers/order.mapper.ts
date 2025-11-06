import {
  CreateOrderDto,
  Order,
  OrderHistory,
  OrderItem,
  TargetSystemEnum
} from '../../../core/types/common.types'
import { Logger } from '@nestjs/common'
import { isEmpty } from '../../../core/utils/is-empty.utils'
import { NOT_PROVIDED } from '../../constants'
import { getShippingLastName, hasEnoughInformation } from '../../utils/orders.util'
import { PartialCompletedDto } from '../dtos/partial-completed.dto'
import {
  ShopifyFulfillmentOrderDto,
  ShopifyMerchantRequestsDto
} from '../dtos/shopify-fulfillment-order.dto'
import { ShopifyOrderDto } from '../dtos/shopify-order.dto'
import { ShopifyShippingLineDto } from '../dtos/shopify-shipping-line.dto'
import { OrderItemMapper } from './order-item.mapper'

export class OrderMapper {
  private static readonly logger = new Logger('ShopifyOrderMapper')

  static calculateTaxAmount(grossAmount: number, taxRate: number): number | null {
    if (isEmpty(taxRate) || isEmpty(grossAmount)) return null
    return (taxRate * grossAmount) / (1 + taxRate)
  }

  static calculateShippingCosts(orderObj: CreateOrderDto, shippingLines: ShopifyShippingLineDto[]) {
    if (!shippingLines || shippingLines.length == 0) return

    const shippingLine = shippingLines[0]

    orderObj.shippingCost = shippingLine?.price ? Number(shippingLine.price) : null
    orderObj.shippingTaxRate = null

    if (shippingLine?.tax_lines?.length !== 0) {
      orderObj.shippingTaxRate = shippingLine?.tax_lines?.[0]?.rate ?? null
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
    fulfillmentOrder: ShopifyFulfillmentOrderDto,
    extraParams: {
      implementationId?: number
      orderHistories?: OrderHistory[]
      partialCompletedFulfillmentIds: PartialCompletedDto
      fulfillmentCountByExistingCustomerIds: Record<string, number>
      shopifyOrder: ShopifyOrderDto
    } = {
      partialCompletedFulfillmentIds: undefined,
      fulfillmentCountByExistingCustomerIds: {},
      shopifyOrder: undefined
    }
  ): CreateOrderDto {
    const shopifyCompleteOrder = extraParams?.shopifyOrder
    const isTaxesIncluded = shopifyCompleteOrder.taxes_included
    let orderItemList: OrderItem[] = []
    let orderTotal = 0,
      orderTotalTaxRate = 0
    let orderDiscount = 0,
      orderDiscountNet = 0,
      orderDiscountTaxAmount = 0,
      orderDiscountTaxRate = 0

    const shopifyOrderId = String(shopifyCompleteOrder.id)
    let customerOrderId = shopifyOrderId

    let isFirstFulfillmentOrder = true
    if (extraParams.fulfillmentCountByExistingCustomerIds[customerOrderId] > 0) {
      customerOrderId += `-${extraParams.fulfillmentCountByExistingCustomerIds[shopifyOrderId]}`
      extraParams.fulfillmentCountByExistingCustomerIds[shopifyOrderId] += 1
      isFirstFulfillmentOrder = false
    } else {
      extraParams.fulfillmentCountByExistingCustomerIds[shopifyOrderId] = 1
    }

    for (let orderItem of fulfillmentOrder.line_items) {
      let item = OrderItemMapper.mapFrom(orderItem, {
        currency: shopifyCompleteOrder.currency,
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
        fulfillmentOrder: JSON.stringify(fulfillmentOrder)
      })
      return null
    }

    const orderItemsLength = orderItemList.length

    orderTotalTaxRate = orderTotalTaxRate / orderItemsLength
    orderDiscountTaxRate = orderTotalTaxRate
    orderDiscountTaxAmount = this.calculateTaxAmount(orderDiscount, orderDiscountTaxRate)
    orderDiscountNet = orderDiscount - orderDiscountTaxAmount

    const shippingFirstName = shopifyCompleteOrder?.shipping_address?.first_name
    const shippingLastName = shopifyCompleteOrder?.shipping_address?.last_name
    const shippingCompanyName = shopifyCompleteOrder?.shipping_address?.company

    const hasEnoughInfo = hasEnoughInformation(
      shippingFirstName,
      shippingLastName,
      shippingCompanyName
    )

    if (!hasEnoughInfo) {
      this.logger.error({
        message: 'Order is missing shippingFirstName, shippingLastName and shippingCompanyName',
        fulfillmentOrder: JSON.stringify(fulfillmentOrder)
      })
      return null
    }

    let orderObj: CreateOrderDto = {
      customerOrderId: customerOrderId,
      customerOrderNumber: String(shopifyCompleteOrder.order_number),
      channel: TargetSystemEnum.SHOPIFY,
      currency: shopifyCompleteOrder.currency,
      shippingFirstName: shippingFirstName || shippingCompanyName || shippingLastName,
      shippingLastName: getShippingLastName(
        shippingFirstName,
        shippingLastName,
        shippingCompanyName
      ),
      shippingAddressLine1: (shopifyCompleteOrder.shipping_address || {}).address1 || '',
      shippingAddressLine2: (shopifyCompleteOrder.shipping_address || {}).address2,
      shippingCompanyName,
      shippingEmail: (shopifyCompleteOrder.customer || {}).email,
      shippingZip: (shopifyCompleteOrder.shipping_address || {}).zip || '',
      shippingCity: (shopifyCompleteOrder.shipping_address || {}).city || '',
      shippingRegion: (shopifyCompleteOrder.shipping_address || {}).province,
      shippingCountryCodeIso: (shopifyCompleteOrder.shipping_address || {}).country_code || '',
      shippingPhone: (shopifyCompleteOrder.shipping_address || {}).phone,
      paymentMethod: shopifyCompleteOrder.payment_gateway_names?.[0] ?? '',
      shippingMethod: shopifyCompleteOrder?.shipping_lines?.[0]?.code || NOT_PROVIDED,
      orderItems: orderItemList,
      implementationId: extraParams.implementationId || null,
      orderHistories: extraParams.orderHistories || null,
      placedAt: new Date(shopifyCompleteOrder.created_at),
      billingFirstName: shopifyCompleteOrder?.billing_address?.first_name || '',
      billingLastName: shopifyCompleteOrder?.billing_address?.last_name || '',
      billingAddressLine1: shopifyCompleteOrder?.billing_address?.address1 || '',
      billingAddressLine2: shopifyCompleteOrder?.billing_address?.address2 || '',
      billingCompanyName: shopifyCompleteOrder?.billing_address?.company || '',
      billingEmail: shopifyCompleteOrder?.billing_address?.email || '',
      billingZip: shopifyCompleteOrder?.billing_address?.zip || '',
      billingCity: shopifyCompleteOrder?.billing_address?.city || '',
      billingRegion: shopifyCompleteOrder?.billing_address?.province || '',
      billingCountryCodeIso: shopifyCompleteOrder?.billing_address?.country_code || '',
      billingPhone: shopifyCompleteOrder?.billing_address?.phone || ''
    }

    orderObj.shippingCost = null
    orderObj.shippingCostNet = null
    orderObj.shippingTaxAmount = null
    orderObj.shippingTaxRate = null

    this.calculateShippingCosts(orderObj, shopifyCompleteOrder.shipping_lines)

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

    const fulfillmentOrderId: number = fulfillmentOrder.id
    const partialFulfillment: boolean =
      extraParams?.partialCompletedFulfillmentIds?.partialFulfilmentsOrderIds.includes(
        fulfillmentOrder.id
      )
    const CompletFulfillment: boolean =
      extraParams?.partialCompletedFulfillmentIds?.completedFulfilmentsOrderIds.includes(
        fulfillmentOrder.id
      )

    if (!isFirstFulfillmentOrder && partialFulfillment) {
      orderObj.shippingCost = 0
      orderObj.shippingCostNet = 0
      orderObj.shippingTaxAmount = 0
      orderObj.shippingTaxRate = 0
    }
    orderObj.metaInfo = {}
    if (fulfillmentOrderId) {
      orderObj.metaInfo.fulfillment_order_id = fulfillmentOrderId.toString()
      orderObj.metaInfo.notifyCustomer = this.getNotifyCustomer(fulfillmentOrder.outgoing_requests)
    }
    if (CompletFulfillment) orderObj.metaInfo.fulfillment_orders_complete = true
    if (partialFulfillment) orderObj.metaInfo.partial_fulfillment = true

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

  public static mapTo(order: Order): ShopifyOrderDto {
    let shopifyOrderItems =
      order.orderItems.map((item) =>
        OrderItemMapper.mapTo(item, { shippingMethod: order.shippingMethod })
      ) || []
    return {
      id: Number(order.customerOrderId),
      total_price: String(order.total),
      currency: order.currency,
      shipping_address: {
        first_name: order.shippingFirstName,
        last_name: order.shippingLastName,
        address1: order.shippingAddressLine1,
        address2: order.shippingAddressLine2,
        company: order.shippingCompanyName,
        zip: order.shippingZip,
        city: order.shippingCity,
        province: order.shippingRegion,
        country_code: order.shippingCountryCodeIso,
        phone: order.shippingPhone
      },
      customer: { email: order.shippingEmail },
      gateway: order.paymentMethod,
      line_items: shopifyOrderItems,
      shipping_lines: undefined,
      billing_address: {
        first_name: order.billingFirstName,
        last_name: order.billingLastName,
        address1: order.billingAddressLine1,
        address2: order.billingAddressLine2,
        company: order.billingCompanyName,
        zip: order.billingZip,
        city: order.billingCity,
        province: order.billingRegion,
        country_code: order.billingCountryCodeIso,
        phone: order.billingPhone
      }
    }
  }
}
