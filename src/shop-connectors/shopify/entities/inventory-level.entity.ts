export interface InventoryLevelType {
  id?: number
  physical?: number
  sellable?: number
  reserved?: number
  damaged?: number
  qualityControl?: number
  safetyStock?: number
  unavailable?: number
}

export interface InventoryLevelTypeSkuImplementation {
  ilsSku: string
  physical?: number
  sellable?: number
  reserved?: number
  damaged?: number
  qualityControl?: number
  safetyStock?: number
  unavailable?: number
}
