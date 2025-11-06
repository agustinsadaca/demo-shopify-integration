import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator'
import { EventType } from '../../core/enums/event-type.enum'
import { InventoryType } from '../../core/enums/inventory-type.enum'

export class CreateInventoryLevelSourceDto {
  @ApiProperty({ required: true })
  @IsDateString()
  eventAt: Date

  @ApiProperty({ required: true })
  @IsNotEmpty()
  sku: string

  @ApiProperty({ required: true })
  @IsNumber()
  @IsPositive()
  implementationId: number

  @ApiProperty({ required: true })
  @IsNumber()
  deltaQuantity: number

  @ApiProperty({ enum: EventType, required: true })
  @IsEnum(EventType)
  event: EventType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  eventEntityId?: number

  @ApiProperty({ enum: InventoryType, required: true })
  @IsEnum(InventoryType)
  type: InventoryType
}