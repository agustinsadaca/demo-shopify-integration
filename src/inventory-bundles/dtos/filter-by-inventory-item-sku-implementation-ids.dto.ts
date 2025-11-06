import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray } from 'class-validator'

export class FilterByInventoryItemSkuImplementationIdsDto {
  @ApiProperty({ type: 'string', required: true, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  inventoryItemSkuImplementationIds: Array<string>
}
