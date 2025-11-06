import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUrl } from 'class-validator'

export class InventoryItemImageUrl {
  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  url: string
}