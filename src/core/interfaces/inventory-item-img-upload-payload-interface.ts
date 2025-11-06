export interface InventoryItemImgUploadPayload {
  inventoryItemId: string
  items: Array<{
    sku: string
    wmsSku: string
    imgUrl: string
  }>
}
