import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator'
import { MetaInfoInventoryItem } from '../../core/interfaces/meta-info-inventory-item.interface'
import { ApiProperty } from '@nestjs/swagger'

export class PutInventoryItemGidDto {
  @ApiProperty()
  @IsNotEmpty()
  customerItemId: string
  @ApiProperty()
  @IsPositive()
  @IsNumber()
  implementationId: number
  @ApiProperty()
  @IsNotEmpty()
  metaInfo: MetaInfoInventoryItem
}
