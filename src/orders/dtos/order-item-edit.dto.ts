import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator'
import { CreateOrderItemDto } from './create-order-item.dto'

export class OrderItemEditDto extends CreateOrderItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @IsNotEmpty()
  id?: number
}