export interface CreatePartnerLocationInventoryItemDto {
  partnerLocationId: number
  inventoryItemId: number
  sku: string
  customerItemId?: string
  implementationId: number
  metaInfo?: {
    [key: string]: any
  }
}
