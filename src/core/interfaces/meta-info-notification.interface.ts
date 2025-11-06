export interface MetaInfoNotification {
  duplicatedSKUs?: DuplicatedSKU,
  message?: string
  inventoryDetails?: InventoryDetail[]
  limitPerMonth?: number
}

export class DuplicatedSKU {
  [key: string]: Array<string>
}

export interface InventoryDetail {
  currentSku?: string
  newSku?: string
}