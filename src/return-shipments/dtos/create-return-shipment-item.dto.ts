import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator'

export class CreateReturnShipmentItemDto {
  @ApiProperty()
  @IsNotEmpty() @IsPositive()
  returnShipmentId: number

  @ApiProperty()
  @IsNotEmpty() @IsString()
  inventoryItemSku: string

  @ApiProperty()
  @IsNotEmpty() @IsPositive()
  returnedQuantity: number

  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  restockableQuantity?: number

  @ApiProperty()
  @IsNotEmpty() @IsString()
  returnReason: string

  @IsOptional() @IsString()
  inventoryItemSkuImplementation?: string

  @ApiProperty({ isArray: true, required: false, default: [] })
  @IsOptional()
  @IsString({ each: true })
  serialNumber?: string[]
}