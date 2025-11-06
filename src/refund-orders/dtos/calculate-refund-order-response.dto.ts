import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator'
import { CreateRefundOrderDto } from './create-refund-order.dto'

export class CalculateRefundOrderResponseDto {
  @ApiProperty({ required: true })
  @IsObject()
  shopResponse: any

  @ApiProperty({ type: () => CreateRefundOrderDto, required: true })
  @IsNotEmptyObject()
  @ValidateNested({ each: true })
  @Type(() => CreateRefundOrderDto)
  refundOrder: CreateRefundOrderDto
}