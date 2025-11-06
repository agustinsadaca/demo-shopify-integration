export interface CreateInventoryItemDto {
  sku: string
  customerItemId?: string
  implementationId: number
  isBundle?: boolean
  metaInfo?: {
    [key: string]: any
  }
}
