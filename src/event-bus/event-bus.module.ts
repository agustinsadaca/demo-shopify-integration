import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ConfigService } from '../config.service'
import { ConsumerService } from './consumer.service'
import { EventBusService } from './event-bus.service'

@Module({
  imports: [
    ClientsModule.register([
      { name: 'KAFKA_SERVICE', ...ConfigService.kafkaConfig() }
    ])
  ],
  providers: [EventBusService, ConsumerService],
  exports: [EventBusService, ConsumerService]
})

export class EventBusModule {

}
