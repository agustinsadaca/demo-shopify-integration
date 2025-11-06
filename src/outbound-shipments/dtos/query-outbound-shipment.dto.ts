import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsByteLength, IsEmail, IsOptional, IsPositive, IsString, IsUppercase } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryOutboundShipmentDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  orderId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  partnerShipmentId?: string

  @ApiProperty({ required: false })
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
  @IsOptional()
  @IsEmail()
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

  @ApiProperty({
    description: 'write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  createdAt?: string

  @ApiProperty({
    description: 'write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  updatedAt?: string

  @ApiProperty({
    description: 'write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  shippedAt?: string

  @ApiProperty({ required: false })
  @IsOptional()
  customerShipmentId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentStatus?: string
}
