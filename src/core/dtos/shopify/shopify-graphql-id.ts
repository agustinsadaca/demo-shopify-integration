// Stub type for demo - generic to support different resource types
export interface ShopifyGraphQLId<T = any> {
  id: string
  legacyId?: number
}
