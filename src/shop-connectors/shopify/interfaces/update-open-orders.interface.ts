import { ShopifyGraphQLId } from '../../../core/types/common.types'
import { ShopifyResources } from '../../../core/types/common.types'

export interface UpdateOpenOrdersData {
  fulfillmentOrderIds: string[],
  fulfillmentOrderGIds: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>[]
  customerOrderIds: string[]
}

export interface UpdateOpenOrdersDataRetryData {
  retryInfo?: UpdateOpenOrdersData
}
