export class ShopifyInventoryItemDto {
  id: number
  sku: string
  updated_at: string
  country_code_of_origin: string
  harmonized_system_code: string
}

export class ShopifyInventoryItemGraphQLDto {
  id: string
  legacyResourceId: string
  countryCodeOfOrigin?: string
  harmonizedSystemCode?: string
  measurement?: {
    weight: {
      value: number
      unit: string
    }
  }
}
