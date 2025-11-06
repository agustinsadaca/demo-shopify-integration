export interface PartnerLocationInventoryItem {
  id?: number
  createdAt?: Date
  updatedAt?: Date
  partnerLocationId: number
  inventoryItemId: number
  sku: string
  customerItemId?: string
  implementationId: number
  metaInfo?: {
    [key: string]: any
  }
}
