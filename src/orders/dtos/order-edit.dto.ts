import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsByteLength, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUppercase, ValidateNested } from 'class-validator'
import { MetaInfoOrder } from '../../core/interfaces/meta-info-order.interface'
import { OrderTagDto } from '../../core/interfaces/order-tag.interface'
import { OrderItemEditDto } from './order-item-edit.dto'

export class OrderEditDto {
  @ApiProperty({ type: Number, required: true })
  @IsPositive()
  id: number

  @ApiProperty({ type: Number, required: true })
  @IsPositive()
  implementationId: number

  @ApiProperty({ type: () => [OrderItemEditDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemEditDto)
  orderItems: OrderItemEditDto[]

  @ApiProperty()
  @IsDateString()
  placedAt: Date

  @ApiProperty({ required: false })
  @IsOptional()
  customerOrderId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  customerOrderNumber?: string

  @ApiProperty({ required: false })
  @IsOptional()
  partnerOrderId?: string

  @ApiProperty()
  @IsNotEmpty()
  channel: string

  @ApiProperty()
  @IsNumber()
  total: number

  @ApiProperty({ required: false })
  @IsOptional()
  currency?: string

  @ApiProperty()
  @IsNotEmpty()
  shippingFirstName: string

  @ApiProperty()
  @IsOptional()
  shippingLastName?: string

  @ApiProperty()
  @IsNotEmpty()
  shippingAddressLine1: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingAddressLine2?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingCompanyName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  shippingEmail?: string

  @ApiProperty()
  @IsNotEmpty()
  shippingZip: string

  @ApiProperty()
  @IsNotEmpty()
  shippingCity: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingRegion?: string

  @ApiProperty({
    description: 'Country ISO Alpha-2 code (Uppercase)',
    minimum: 2,
    maximum: 2,
  })
  @IsNotEmpty() @IsString() @IsUppercase() @IsByteLength(2, 2)
  shippingCountryCodeIso: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingPhone?: string

  @ApiProperty()
  @IsNotEmpty()
  shippingMethod: string

  @ApiProperty({ required: false })
  @IsOptional()
  paymentMethod?: string

  @ApiProperty({ type: () => [OrderTagDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderTagDto)
  tags?: OrderTagDto[]

  @ApiProperty()
  @IsNumber()
  totalNet: number

  @ApiProperty()
  @IsNumber()
  totalTaxAmount: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalTaxRate?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  shippingCost?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  shippingCostNet?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  shippingTaxAmount?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  shippingTaxRate?: number

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
  billingFirstName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  billingLastName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  billingAddressLine1?: string

  @ApiProperty({ required: false })
  @IsOptional()
  billingAddressLine2?: string

  @ApiProperty({ required: false })
  @IsOptional()
  billingCompanyName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  billingEmail?: string

  @ApiProperty({ required: false })
  @IsOptional()
  billingZip?: string

  @ApiProperty({ required: false })
  @IsOptional()
  billingCity?: string

  @ApiProperty({ required: false })
  @IsOptional()
  billingRegion?: string

  @ApiProperty({
    description: 'Country ISO Alpha-2 code (Uppercase)',
    minimum: 2,
    maximum: 2,
    required: false
  })
  @IsOptional() @IsString() @IsUppercase() @IsByteLength(2, 2)
  billingCountryCodeIso?: string

  @ApiProperty({ required: false })
  @IsOptional()
  billingPhone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  metaInfo?: MetaInfoOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentStatus?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refundStatus?: string

  @ApiProperty()
  @IsPositive()
  relatedOrderId: number
}