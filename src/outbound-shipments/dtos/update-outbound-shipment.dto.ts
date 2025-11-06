import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsByteLength, IsEmail, IsNotEmpty, IsOptional, IsPositive, IsString, IsUppercase } from 'class-validator'
import { CreateOutboundShipmentDto } from './create-outbound-shipment.dto'

export class UpdateOutboundShipmentDto extends PartialType(CreateOutboundShipmentDto) {
  @ApiProperty({ required: false })
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  orderId?: number

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  partnerShipmentId?: string

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  carrier?: string

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
    description: 'Country ISO Alpha-2 code (Uppercase)',
    minimum: 2,
    maximum: 2,
    required: false
  })
  @IsOptional() @IsString() @IsUppercase() @IsByteLength(2, 2)
  shippingCountryCodeIso?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingPhone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingMethod?: string

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  customerShipmentId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentStatus?: string
}