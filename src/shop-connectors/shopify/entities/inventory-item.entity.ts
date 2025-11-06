import { Implementation } from './implementation.entity'

export interface InventoryItem {
  id?: number
  createdAt?: Date
  updatedAt?: Date
  sku: string
  skuImplementation?: string
  customerItemId?: string
  implementationId: number
  isBundle?: boolean
  metaInfo?: {
    shopify_inventory_item_id?: string
    shopify_inventory_item_gid?: string
    [key: string]: any
  }
  implementation?: Implementation
  returnShipmentItems?: any[]
  returnRequestItems?: any[]
  orderItems?: any[]
}
