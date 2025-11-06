import { PartialType } from '@nestjs/swagger'
import { CreateRefundOrderItemDto } from './create-refund-order-item.dto'

export class UpdateRefundOrderItemDto extends PartialType(CreateRefundOrderItemDto) { }