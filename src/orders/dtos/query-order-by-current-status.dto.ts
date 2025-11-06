import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsOptional, IsPositive } from 'class-validator'
import { OrderStatusAll } from '../../core/enums/order-status.enum'
import { RefundOrderStatusAll } from '../../core/enums/refund-order-status.enum'
import { ReturnRequestStatusAll } from '../../core/enums/return-request-status.enum'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryOrderByCurrentStatusDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  implementationId?: number

  @ApiProperty({
    required: false,
    isArray: true,
    description: `add all status to be filtered like ${Object.values(OrderStatusAll).join(', ')}`,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  orderHistoryStatus?: string[]

  @ApiProperty({
    required: false,
    isArray: true,
    description: `add all status to be filtered like ${Object.values(RefundOrderStatusAll).join(', ')}`,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  refundOrderHistoryStatus?: string[]

  @ApiProperty({
    required: false,
    isArray: true,
    description: `add all status to be filtered like ${Object.values(ReturnRequestStatusAll).join(', ')}`,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  returnRequestHistoryStatus?: string[]

  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value && value === 'true')
  returnShipmentExists?: boolean

  @ApiProperty({
    description: "add a string to be contained in either of 'shippingFirstName', 'shippingLastName', 'customerOrderNumber'",
    required: false
  })
  @IsOptional()
  contains?: string

  @ApiProperty({
    required: false,
    description: 'write json as { "field": "fieldName", "direction": "ASC" | "DESC" }',
    example: '{ "field": "placedAt", "direction": "ASC" }',
  })
  @IsOptional()
  sortBy?: string
}