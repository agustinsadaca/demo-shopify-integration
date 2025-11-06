import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator'

export class CalculateRefundOrderItemDto {
  @ApiProperty({ required: true })
  @IsPositive()
  orderItemId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  sku: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  customerLineItemId?: string

  @ApiProperty({ required: true })
  @IsPositive()
  quantity: number
}