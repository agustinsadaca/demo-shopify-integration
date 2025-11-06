import { AddressValidationResultDto } from '../dtos/address-validation/address-validation-result.dto'
import { ShopifyGraphQLId } from '../dtos/shopify/shopify-graphql-id'
import { ShopifyResources } from '../enums/shopify-resources.enum'

export interface MetaInfoOrder {
  fulfillment_order_id?: string
  shopify_fulfillment_order_gid?: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
  shopify_order_gid?: ShopifyGraphQLId<ShopifyResources.Order>
  isAnonymized?: boolean
  isManualShopOrder?: boolean
  orderDeliveryId?: string
  isShippingMethodUnknown?: boolean
  partial_fulfillment?: boolean
  fulfillment_orders_complete?: boolean
  notifyCustomer?: boolean
  shopName?: string
  addressValidationResult?: AddressValidationResultDto
  noAddressValidationReason?: string
}
