import { Implementation } from './implementation.entity'
import { InventoryItem } from './inventory-item.entity'

export interface InventoryBundle {
  id: number
  createdAt: Date
  updatedAt: Date
  implementationId: number
  bundleSkuImplementation: string
  inventoryItemSkuImplementation: string
  quantity: number
  implementation: Implementation
  bundleInventoryItem: InventoryItem
  inventoryItem: InventoryItem
}
