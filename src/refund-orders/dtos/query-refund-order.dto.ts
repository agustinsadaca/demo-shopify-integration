import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryRefundOrderDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  orderId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  implementationId?: number

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  lineItemsTotal?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  lineItemsTotalTax?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  shippingTotal?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  shippingTotalTax?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  total?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  discountTotal?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  totalTax?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  returnShipmentId?: number

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  refundReason?: string
}