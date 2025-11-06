import { Module } from '@nestjs/common'
import { CoreModule } from '../core/core.module'
import { OutboundShipmentsService } from './outbound-shipments.service'

@Module({
  imports: [CoreModule],
  providers: [OutboundShipmentsService],
  exports: [OutboundShipmentsService]
})
export class OutboundShipmentsModule { }
