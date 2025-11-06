import { PickType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'
import { UpdateInventoryItemDto } from './update-inventory-item.dto'

export class UpdateInventoryItemActiveStatusDto extends PickType(UpdateInventoryItemDto, [
  'isActive'
]) {
  @ApiProperty({ required: true })
  @IsBoolean()
  isActive: boolean
}
