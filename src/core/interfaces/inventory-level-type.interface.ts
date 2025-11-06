import { ApiProperty } from '@nestjs/swagger'

export class InventoryLevelType {
  @ApiProperty()
  physical: number

  @ApiProperty()
  reserved: number

  @ApiProperty()
  sellable: number
}