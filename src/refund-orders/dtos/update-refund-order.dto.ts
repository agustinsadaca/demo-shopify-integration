import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsObject, IsOptional, IsPositive, IsString } from 'class-validator'
import { RefundOrderMetaInfo } from '../../core/interfaces/refund-order-meta-info.interface'

export class UpdateRefundOrderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  orderId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  implementationId?: number

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  returnShipmentId?: number

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
