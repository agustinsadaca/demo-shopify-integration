import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator'
import { RefundOrderStatusAll } from '../../core/enums/refund-order-status.enum'
import { RefundOrderHistoryTag } from '../../core/interfaces/refund-order-history-tag.interface'

export class CreateRefundOrderHistoryDto {
  @ApiProperty({ required: true })
  @IsPositive()
  refundOrderId: number

  @ApiProperty({ enum: RefundOrderStatusAll })
  @IsNotEmpty()
  @IsString()
  @IsEnum(RefundOrderStatusAll)
  status: string

  @ApiProperty({ type: () => [RefundOrderHistoryTag], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RefundOrderHistoryTag)
  tags?: RefundOrderHistoryTag[]
}