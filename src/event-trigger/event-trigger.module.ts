import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConnectionAuthsModule } from '../connection-auths/connection-auths.module'
import { EventBusModule } from '../event-bus/event-bus.module'
import { EventHandlersModule } from '../event-handlers/event-handlers.module'
import { SyncPreferencesModule } from '../sync-preferences/sync-preferences.module'
import { RetryEvent } from './entities/retry-event.entity'
import { EventTriggerService } from './event-trigger-service'
import { RetryEventService } from './retry-event.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([RetryEvent]),
    EventBusModule,
    forwardRef(() => EventHandlersModule),
    SyncPreferencesModule,
    forwardRef(() => ConnectionAuthsModule),
  ],
  providers: [EventTriggerService, RetryEventService],
  exports: [EventTriggerService, RetryEventService]
})
export class EventTriggerModule {}
