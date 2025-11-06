import { InventoryItem } from '../entities/inventory-item.entity'

export class SpecificReturnPeriodResponse {
  returnPeriod: number
  inventoryItems: InventoryItem[]
}

export class ReturnPeriodsResponse {
  generalReturnPeriod: number
  specificReturnPeriods: SpecificReturnPeriodResponse[]
}