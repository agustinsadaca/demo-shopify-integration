import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsByteLength, IsEmail, IsNotEmpty, IsOptional, IsPositive, IsString, IsUppercase, isEmpty } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryOrderDto extends PaginatorDto {
  @ApiProperty({ required: false, isArray: true, nullable: false })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value
    if (isEmpty(value)) return []
    return value.split(',')
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ message: "Tag name should not be empty", each: true })
  tags?: string[]

  @ApiProperty({ required: false, isArray: true, nullable: false })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value
    if (isEmpty(value)) return []
    return value.split(',').map(Number).filter((id) => !isNaN(id))
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ message: "order ids should not be empty", })
  ids?: number[]

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  implementationId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  customerOrderId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  customerOrderNumber?: string

  @ApiProperty({ required: false })
  @IsOptional()
  partnerOrderId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  channel?: string

  @ApiProperty({ required: false })
  @IsOptional()
  currency?: string

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
  @IsNotEmpty() @IsString() @IsUppercase() @IsByteLength(2, 2)
  @IsOptional()
  shippingCountryCodeIso?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingPhone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  shippingMethod?: string

  @ApiProperty({ required: false })
  @IsOptional()
  paymentMethod?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  total?: string

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
  placedAt?: string

  @ApiProperty({
    description: "add a string to be contained in either of 'shippingFirstName', 'shippingLastName', 'customerOrderId', 'partnerOrderId'",
    required: false
  })
  @IsOptional()
  contains?: string

  @ApiProperty({
    required: false,
    isArray: true,
    description: 'add all status to be filtered like new, open, updated, shipped, returned, completed, etc.',
  })
  @IsOptional()
  status?: string

  @ApiProperty({
    description: 'returnReceivedAt param is to filter orders based on related latest ReturnShipment\'s receivedAt write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  returnReceivedAt?: string

  @ApiProperty({
    description: 'statusUpdatedAt param is to filter orders based on related latest Order History\'s createdAt write json as {"key": "timestamp"}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": "2021-11-02T11:52:23.465Z"}',
    required: false
  })
  @IsOptional()
  statusUpdatedAt?: string

  @ApiProperty({
    required: false,
    description: 'write json as { "field": "fieldName", "direction": "ASC" | "DESC" }',
    example: '{ "field": "placedAt", "direction": "ASC" }',
  })
  @IsOptional()
  sortBy?: string

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
  serialNumbers?: string

  @ApiProperty({ required: false })
  @IsOptional()
  lotNumbers?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentStatus?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refundStatus?: string

  @ApiPropertyOptional({ type: Number })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  relatedOrderId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isReport?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  addressValidationNecessary?: boolean
}
