import { ApiProperty } from '@nestjs/swagger'
import { InventoryLevelType } from './inventory-level-type.interface'

export class InventoryLevelTypeSkuImplementation extends InventoryLevelType {
  @ApiProperty()
  ilsSku: string
}