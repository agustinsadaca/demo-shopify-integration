import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { MetaInfoOrderItem } from '../../core/interfaces/meta-info-order-item.interface'

export class CreateOrderItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  orderId?: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  inventoryItemSku: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  pricePaid?: number

  @ApiProperty({ required: true })
  @IsPositive()
  quantity: number

  @ApiProperty({ required: false })
  @IsOptional()
  currency?: string

  @IsOptional() @IsString()
  inventoryItemSkuImplementation?: string

  @ApiProperty({ required: false })
  @IsOptional()
  customerLineItemId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  unitPrice?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  unitPriceNet?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pricePaidNet?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  taxAmount?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  taxRate?: number

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isBundle?: boolean

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  belongsToBundle?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  metaInfo?: MetaInfoOrderItem

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discount?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discountNet?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discountTaxAmount?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discountTaxRate?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discountRate?: number

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isShipsWithItem?: boolean
}
