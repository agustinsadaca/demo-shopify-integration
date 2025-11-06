export class ShopifyFulfillmentServiceDto {
  id: string
  name: string
  service_name: string
  location_id: string
  location_gid: string
  admin_graphql_api_id: string
}

export class ShopifyFulfillmentServiceGraphQLDto {
  id: string
  serviceName: string
  location: {
    id: string
    legacyResourceId: string
    name: string
  }
}
