import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryRefundOrderItemDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  refundOrderId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  sku?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  quantity?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  unitPrice?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  unit_tax?: string

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
  totalTax?: string

}