import { InventoryItemStatus } from '../enums/inventory-item-status.enum'

export class InventoryItemsAggregatedByStatusResponse {
  [InventoryItemStatus.syncedToWms]?: number
  [InventoryItemStatus.readyToBeSynced]: number
  [InventoryItemStatus.notReady]: number
}
