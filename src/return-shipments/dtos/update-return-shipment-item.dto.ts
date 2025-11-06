import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsPositive, IsString } from 'class-validator'

export class UpdateReturnShipmentItemDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  returnShipmentId?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  inventoryItemSku?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  returnedQuantity?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  restockableQuantity?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  returnReason?: string

  @IsOptional() @IsString()
  inventoryItemSkuImplementation?: string

  @ApiProperty({ isArray: true, required: false, default: [] })
  @IsOptional()
  @IsString({ each: true })
  serialNumber?: string[]
}