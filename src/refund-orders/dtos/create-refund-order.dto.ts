import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested
} from 'class-validator'
import { RefundOrderHistory } from '../entities/refund-order-history.entity'
import { RefundOrderItem } from '../entities/refund-order-item.entity'
import { RefundOrderMetaInfo } from '../../core/interfaces/refund-order-meta-info.interface'
import { CreateRefundOrderHistoryFromReturnsDto } from './create-refund-order-history-from-refund-order.dto'
import { CreateRefundOrderItemDto } from './create-refund-order-item.dto'

export class CreateRefundOrderDto {
  @ApiProperty({ required: true })
  @IsPositive()
  orderId: number

  @ApiProperty({ required: true })
  @IsPositive()
  implementationId: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  lineItemsTotal?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  lineItemsTotalTax?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  shippingTotal?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  shippingTotalTax?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  total?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discountTotal?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalTax?: number

  @ApiProperty({ type: CreateRefundOrderItemDto, isArray: true })
  @IsNotEmpty()
  @ArrayNotEmpty()
  refundOrderItems: RefundOrderItem[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  returnShipmentId?: number

  @ApiProperty({ type: CreateRefundOrderHistoryFromReturnsDto, isArray: true, required: false })
  @ValidateNested({ each: true })
  @Type(() => CreateRefundOrderHistoryFromReturnsDto)
  @IsOptional()
  refundOrderHistories?: RefundOrderHistory[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refundReason?: string

  /**
   * The ID of the refund at shop side
   */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerRefundId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metaInfo?: RefundOrderMetaInfo
}
