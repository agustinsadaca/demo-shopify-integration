import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator'
import { EventType } from '../../core/enums/event-type.enum'
import { InventoryType } from '../../core/enums/inventory-type.enum'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryInventoryLevelSourceDto extends PaginatorDto {
  @ApiProperty({
    description: 'write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  eventAt?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  sku?: string

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  implementationId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  deltaQuantity?: number

  @ApiProperty({ enum: EventType, required: false })
  @IsOptional()
  @IsEnum(EventType)
  event?: EventType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  eventEntityId?: number

  @ApiProperty({ enum: InventoryType, required: false })
  @IsOptional()
  @IsEnum(InventoryType)
  type?: InventoryType
}