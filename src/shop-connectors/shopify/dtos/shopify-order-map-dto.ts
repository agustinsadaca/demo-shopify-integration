import { ShopifyFulfillmentOrderDto, ShopifyFulfillmentOrderGraphQLDto } from './shopify-fulfillment-order.dto'
import { ShopifyOrderDto, ShopifyOrderGraphQLDto } from './shopify-order.dto'

export class OrderMapValues {
  order?: ShopifyOrderDto
  fulfillments?: ShopifyFulfillmentOrderDto[]
}

export type OrderMap = Map<string, OrderMapValues>

export class OrderMapValuesGraphQL {
  order?: ShopifyOrderGraphQLDto
  fulfillments?: ShopifyFulfillmentOrderGraphQLDto[]
}

export type OrderMapGraphQL = Map<string, OrderMapValuesGraphQL>
