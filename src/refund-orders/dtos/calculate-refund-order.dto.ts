import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsPositive } from 'class-validator'
import { CalculateRefundOrderItemDto } from './calculate-refund-order-item.dto'

export class CalculateRefundOrderDto {
  @ApiProperty({ required: true })
  @IsPositive()
  orderId: number

  @ApiProperty({ required: true })
  @IsPositive()
  implementationId: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  customerOrderId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  returnShipmentId?: number

  @ApiProperty({ type: CalculateRefundOrderItemDto, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  orderItems: CalculateRefundOrderItemDto[]

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  refundShipping: boolean

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isRefundRequired?: boolean
}