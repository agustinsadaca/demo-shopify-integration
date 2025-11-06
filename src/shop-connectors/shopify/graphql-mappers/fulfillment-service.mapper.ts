import {
  ShopifyFulfillmentServiceDto,
  ShopifyFulfillmentServiceGraphQLDto
} from '../dtos/shopify-fulfillment-service.dto'

export class FulfillmentServiceMapper {
  public static mapFrom(
    shopifyFulfillmentService: ShopifyFulfillmentServiceGraphQLDto
  ): ShopifyFulfillmentServiceDto {
    const splittedArr = shopifyFulfillmentService.id.split('/')
    const id = splittedArr[splittedArr.length - 1].split('?')[0]
    return {
      id,
      name: shopifyFulfillmentService.location.name,
      service_name: shopifyFulfillmentService.serviceName,
      admin_graphql_api_id: shopifyFulfillmentService.id,
      location_gid: shopifyFulfillmentService.location.id,
      location_id: shopifyFulfillmentService.location.legacyResourceId
    }
  }
}
