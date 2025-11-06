import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryOrderItemDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  orderId?: number

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  inventoryItemSku?: string

  @ApiProperty({ required: false })
  @IsOptional()
  currency?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  pricePaid?: string

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
  unitPriceNet?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  pricePaidNet?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  taxAmount?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  taxRate?: string

  @ApiProperty({
    description: 'write json as {"key": number}, Allowed keys are gte, lte, gt, lt',
    example: '{"gte": 1000}',
    required: false
  })
  @IsOptional()
  quantity?: string

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

  @ApiProperty({ required: false })
  @IsOptional()
  customerLineItemId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isBundle?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  belongsToBundle?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isShipsWithItem?: boolean
}
