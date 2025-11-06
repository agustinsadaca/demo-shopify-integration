import { BullModule } from '@nestjs/bull'
import { Global, Module } from '@nestjs/common'
import { BrandLabelModule } from '../brand-label/brand-label.module'
import { EventTriggerModule } from '../event-trigger/event-trigger.module'
import { GLOBAL_SHARED_QUEUE, QUEUE_SERVICE_TOKEN } from './queue.constant'
import { QueueProcessor } from './queue.processor'
import { QueueService } from './queue.service'

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: GLOBAL_SHARED_QUEUE
    }),
    EventTriggerModule,
    BrandLabelModule
  ],
  providers: [
    {
      provide: QUEUE_SERVICE_TOKEN,
      useClass: QueueService
    },
    QueueProcessor
  ],
  exports: [QUEUE_SERVICE_TOKEN]
})
export class SharedQueueModule {}
