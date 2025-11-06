import { PartialType } from '@nestjs/swagger'
import { CreateRefundOrderHistoryDto } from './create-refund-order-history.dto'

export class UpdateRefundOrderHistoryDto extends PartialType(CreateRefundOrderHistoryDto) { }
