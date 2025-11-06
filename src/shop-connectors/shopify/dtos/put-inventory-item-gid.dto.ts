export interface PutInventoryItemGidDto {
  inventoryItemId?: number
  customerItemId?: string
  shopifyInventoryItemGid?: string
  implementationId: number
  metaInfo?: {
    shopify_product_variant_gid?: string
    shopify_inventory_item_gid?: string
    [key: string]: any
  }
}
