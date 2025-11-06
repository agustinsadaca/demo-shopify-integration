import { Module } from '@nestjs/common'
import { CoreModule } from '../core/core.module'
import { OrdersModule } from '../orders/orders.module'
import { RefundOrdersService } from './refund-orders.service'

@Module({
  imports: [CoreModule, OrdersModule],
  providers: [RefundOrdersService],
  exports: [RefundOrdersService]
})
export class RefundOrdersModule { }