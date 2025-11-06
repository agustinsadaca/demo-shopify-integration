import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { Order } from '../entities/order.entity'

export class ExtendedOrderDto extends Order {
  @ApiProperty({ required: false, type: () => Order })
  @IsOptional()
  relatedOrder?: Order

  @ApiProperty({ required: false })
  @IsOptional()
  changeableUntil?: Date
}