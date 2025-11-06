import { TargetSystemEnum } from '../../shop-connectors/shopify/entities/enums.entity'
import { RateLimitConfig } from './rate-limit-config.enum'

// Placeholder for BillbeeQueryOrderDto since billbee connector doesn't exist
interface BillbeeQueryOrderDto {
  // Add properties as needed
}

type TSFilterType<TS = TargetSystemEnum> = TS extends TargetSystemEnum.BILLBEE
  ? BillbeeQueryOrderDto
  : any

export class ConnectionAuthMetaInfo<TS = TargetSystemEnum> {
  order?: {
    lastSyncedCustomerOrderId?: string
    lastSyncedOrderNumber?: string
    filter?: any
    apiFilter?: TSFilterType<TS>
    shipping_item_sku?: Number[]
    discount_item_sku?: Number[]
    discount_item_prefix?: string
  }
  inventory_item?: {
    filter?: any
  }
  subClientInfo?: any
  fulfillmentServiceId?: string
  fulfillerId?: string
  warehouseId?: string
  shopifyPlan?: ShopifyPlan
  billbeeShopIds?: string[]
  /**
   * The facility ID of DHL FFN
   */
  facilityId?: string
  /**
   * The customer ID of DHL FFN
   */
  customerId?: string
  /**
   * Represents the address formats for different countries.
   *
   * The `key` is the country code in ISO format.
   */
  addressFormats?: {
    [key: string]: AddressFormatType
  }
  shopifyOrderNumberFormat?: {
    orderNumberFormatPrefix: string
    orderNumberFormatSuffix: string
  }
}

export enum AddressFormatType {
  HOUSE_NUMBER_THEN_STREET_NAME = 'house_number_then_street_name',
  STREET_NAME_THEN_HOUSE_NUMBER = 'street_name_then_house_number'
}

export class ShopifyPlan {
  planDisplayName?: string
  planName?: string
  rateLimit?: RateLimitConfig
}
