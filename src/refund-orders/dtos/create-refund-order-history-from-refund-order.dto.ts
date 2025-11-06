import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { RefundOrderStatusAll } from '../../core/enums/refund-order-status.enum'

export class CreateRefundOrderHistoryFromReturnsDto {

  @ApiProperty({ enum: RefundOrderStatusAll })
  @IsNotEmpty()
  @IsString()
  @IsEnum(RefundOrderStatusAll)
  status: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  carrierCreatedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  carrierUpdatedAt?: Date

}
