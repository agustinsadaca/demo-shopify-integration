import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsByteLength, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsPositive, IsString, IsUppercase, ValidateNested } from 'class-validator'
import { OutboundShipmentHistory } from '../entities/outbound-shipment-history.entity'
import { OutboundShipmentItem } from '../entities/outbound-shipment-item.entity'
import { CreateOutboundShipmentHistoryFromShipmentDto } from './create-outbound-shipment-history-from-shipment.dto'
import { CreateOutboundShipmentItemDto } from './create-outbound-shipment-item.dto'

export class CreateOutboundShipmentDto {
  @ApiProperty({ type: Number, required: true })
  @IsPositive()
  @IsNotEmpty()
  orderId: number

  @ApiProperty({ type: CreateOutboundShipmentItemDto, isArray: true })
  @IsNotEmpty()
  @ArrayNotEmpty()
  outboundShipmentItems: OutboundShipmentItem[]

  @ApiProperty({ type: CreateOutboundShipmentHistoryFromShipmentDto, isArray: true, required: false })
  @ValidateNested({ each: true })
  @Type(() => CreateOutboundShipmentHistoryFromShipmentDto)
  @IsOptional()
  outboundShipmentHistories?: OutboundShipmentHistory[]

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  partnerShipmentId?: string

  @ApiProperty()
  @IsNotEmpty()
  carrier: string

  @ApiProperty({ required: false })
  @IsOptional()
  trackingCode?: string

  @ApiProperty({ required: false })
  @IsOptional()
  trackingCodeReturn?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingFirstName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingLastName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingAddressLine1?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingAddressLine2?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingCompanyName?: string

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  shippingEmail?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingZip?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingCity?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingRegion?: string

  @ApiProperty({
    required: false,
    description: 'Country ISO Alpha-2 code (Uppercase)',
    minimum: 2,
    maximum: 2,
  })
  @IsString() @IsUppercase() @IsByteLength(2, 2) @IsOptional()
  shippingCountryCodeIso?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingPhone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingMethod?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  shippedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  customerShipmentId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentStatus?: string
}
