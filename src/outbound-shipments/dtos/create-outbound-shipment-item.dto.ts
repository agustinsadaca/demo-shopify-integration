import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator'
import { LotNumberQuantity } from '../../core/interfaces/lot-number-quantity.interface'

export class CreateOutboundShipmentItemDto {
  @ApiProperty({ required: true })
  @IsPositive()
  @IsNotEmpty()
  outboundShipmentId: number

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  orderItemSku: string

  @ApiProperty({ required: true })
  @Min(0)
  @IsNotEmpty()
  quantity: number

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  belongsToBundle?: boolean

  @ApiProperty({ type: () => [LotNumberQuantity], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LotNumberQuantity)
  lotNumberQuantities?: LotNumberQuantity[]

  @ApiProperty({ isArray: true, required: false, default: [] })
  @IsOptional()
  @IsString({ each: true })
  serialNumber?: string[]

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isShipsWithItem?: boolean
}
