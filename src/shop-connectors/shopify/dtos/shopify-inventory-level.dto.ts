import { ShopifyInventoryStates } from '../enums/shopify-inventory-states-enum'

export class ShopifyInventoryLevelDto {
  inventory_item_id: number
  available: number
  location_id?: number
  updated_at?: string
}

export class ShopifyInventoryLevelGraphQlDto {
  /**
   * graphql id
   */
  id: string

  quantities: Array<{ name: ShopifyInventoryStates; quantity: number }>
}
export class ShopifyMultipleInventoryLevelGraphQlDto extends ShopifyInventoryLevelGraphQlDto {

  inventoryItemId: string

}


