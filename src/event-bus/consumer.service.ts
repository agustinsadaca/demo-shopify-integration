import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopic, Kafka, logLevel } from 'kafkajs'
import { ConfigService } from '../config.service'

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly logger = new Logger(ConsumerService.name)
  private readonly kafkaConfig = ConfigService.kafkaConfig()
  private readonly kafka: Kafka = new Kafka({
    brokers: this.kafkaConfig.options.client.brokers,
    clientId: this.kafkaConfig.options.client.clientId,
    logCreator: (level) => {
      return (logEntry) => {
        if (level === logLevel.ERROR) this.logger.error(logEntry)
        else if (level === logLevel.WARN) this.logger.warn(logEntry)
        else this.logger.log(logEntry)
      }
    }
    //logLevel: logLevel.DEBUG
  })
  private readonly consumers: Map<string, { consumer: Consumer, config: ConsumerRunConfig }> = new Map()
  private lastHeartbeat: Map<string, Date> = new Map()
  HEARTBEAT_CHECK_IN_MS = 1000 * 60 * 3


  async consume(topic: ConsumerSubscribeTopic, config: ConsumerRunConfig) {
    if (!ConfigService.isKafkaEnabled()) {
      return
    }

    const groupId = `${ConfigService.kafkaConfig().options.consumer.groupId}-${topic.topic}`
    const consumer = this.kafka.consumer({ groupId: groupId })
    this.consumers.set(topic.topic.toString(), { consumer, config })
    this.instrumentEvents(consumer)
    await consumer.connect()
    await consumer.subscribe(topic)
    await consumer.run({ autoCommitInterval: 2000, ...config })
    this.startHeartbeatCheck(consumer, topic, config)
  }

  async onApplicationShutdown() {
    this.logger.log('Shutting down consumers...')
    for (const [topic, { consumer }] of this.consumers.entries()) {
      await consumer.disconnect()
      this.logger.log(`Consumer shutted down ${topic}`)
    }
    this.logger.log('Consumers shut down.')
  }

  async findAndRestartConsumer(topic: string): Promise<string> {
    let result = 'failed'
    try {
      const { consumer, config } = this.consumers.get(topic)
      if (consumer) {
        await this.restartConsumer(consumer, { topic: topic }, config, true)
      }
      result = 'success'
    } catch (error) {
      this.logger.error(`Could not restart consumer for topic ${topic}`)
    } finally {
      return result
    }
  }

  instrumentEvents(consumer: Consumer) {
    const { HEARTBEAT, CONNECT, GROUP_JOIN, DISCONNECT, CRASH, REBALANCING } = consumer.events
    consumer.on(HEARTBEAT, e => {
      const topic = this.getByValue(this.consumers, consumer)
      this.lastHeartbeat.set(topic, new Date())
    })

    consumer.on(CONNECT, e => {
      const topic = this.getByValue(this.consumers, consumer)
      this.logger.log({ message: `Kakfa Consumer CONNECT for topic ${topic} at ${e.timestamp}`, kafkaConsumerConnectEvent: e })
    })
    consumer.on(GROUP_JOIN, e => this.logger.log({ message: `Kakfa Consumer GROUP_JOIN at ${e.timestamp}`, kafkaConsumerGroupJoinEvent: e }))
    consumer.on(DISCONNECT, e => {
      const topic = this.getByValue(this.consumers, consumer)
      this.logger.log({ message: `Kakfa Consumer DISCONNECT for topic ${topic} at ${e.timestamp}`, kafkaConsumerDisconnectEvent: e })
    })
    consumer.on(CRASH, e => this.logger.log({ message: `Kakfa Consumer CRASH at ${e.timestamp}`, kafkaConsumerCrashEvent: e }))
    consumer.on(REBALANCING, e => this.logger.log({ message: `Kakfa Consumer REBALANCING at ${e.timestamp}`, kafkaConsumerRebalancingEvent: e }))
  }

  private startHeartbeatCheck(consumer: Consumer, topic: ConsumerSubscribeTopic, config: ConsumerRunConfig) {
    setInterval(async (topic, config) => {
      const now = new Date()
      const lastHeartbeat = this.lastHeartbeat.get(topic.topic.toString())
      if (!(lastHeartbeat instanceof Date)) {
        this.logger.error(`No heartbeat for topic ${topic.topic.toString()}`)
        return
      }

      if ('sftp-messages' === topic.topic.toString()) {
        this.logger.log(`Last heartbeat for topic ${topic.topic.toString()} was ${now.getTime() - lastHeartbeat.getTime()} ms ago`)
      }

      const diff = now.getTime() - lastHeartbeat.getTime()
      if (lastHeartbeat.getTime() < now.getTime() - this.HEARTBEAT_CHECK_IN_MS) {
        this.logger.error(`Kafka Consumer ${topic.topic} has not sent heartbeat in ${diff} ms.`)
        await this.restartConsumer(consumer, topic, config)
      }
    }, this.HEARTBEAT_CHECK_IN_MS, topic, config)
  }

  private async restartConsumer(consumer: Consumer, topic: ConsumerSubscribeTopic, runConfig: ConsumerRunConfig, manualTrigger: boolean = false) {
    try {
      let msg = `Restarting Kafka Consumer ${topic.topic}`
      if (manualTrigger) this.logger.log(msg)
      else this.logger.error(msg)

      await consumer.disconnect()
      this.consumers.delete(topic.topic.toString())
      await this.consume(topic, runConfig)
    } catch (err) {
      this.logger.error(err, err?.stack)
    }
  }

  private getByValue(map, searchValue) {
    for (let [key, { consumer }] of map.entries()) {
      if (consumer === searchValue)
        return key
    }
  }
}