import { forwardRef, Module } from '@nestjs/common'
import { ConnectionAuthsModule } from '../connection-auths/connection-auths.module'
import { CoreModule } from '../core/core.module'
import { OrdersService } from './orders.service'

@Module({
  imports: [
    CoreModule,
    forwardRef(() => ConnectionAuthsModule)
  ],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule { }
