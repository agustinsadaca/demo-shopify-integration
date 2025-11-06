import { Module } from '@nestjs/common'
import { CoreModule } from '../core/core.module'
import { ReturnShipmentsService } from './return-shipments.service'

@Module({
  imports: [CoreModule],
  providers: [ReturnShipmentsService],
  exports: [ReturnShipmentsService]
})
export class ReturnShipmentsModule { }
