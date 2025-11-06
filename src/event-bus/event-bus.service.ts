import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { ConfigService } from './../config.service'

@Injectable()
export class EventBusService implements OnModuleInit {
  private readonly logger = new Logger(EventBusService.name)

  constructor(@Inject('KAFKA_SERVICE') private client: ClientProxy) {}

  async onModuleInit() {
    try {
      if (ConfigService.isKafkaEnabled()) {
        this.logger.log('Kafka connecting')
        await this.client.connect()
        this.logger.log('Kafka connected')
      }
    } catch (err) {
      this.logger.error(err, err?.stack)
    }
  }

  async publishEvent(topic, payload) {
    if (ConfigService.isKafkaEnabled()) {
      this.logger.log({
        message: 'publishing event',
        publishingEventData: JSON.stringify({ topic, payload })
      })
      this.client.emit(topic, payload).subscribe({
        next: () =>
          this.logger.log({
            message: 'kafka message published',
            kafkaMessagePublishedData: JSON.stringify({ topic, payload })
          }),
        error: (error) => this.logger.error(error, error?.stack),
        complete: () => this.logger.log(`kafka message publish completed for topic: ${topic}`)
      })
    }
  }
}
