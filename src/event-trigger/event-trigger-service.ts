import { EntityEnum, JwtUser, OrgType } from '../core/types/common.types'
import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ConnectionAuthsService } from '../connection-auths/connection-auths.service'
import { EventPayload } from '../core/interfaces/event-payload.interface'
import { checkForUnauthorizedAccess } from '../core/utils/queryConnector.util'
import { ConsumerService } from '../event-bus/consumer.service'
import { EventBusService } from '../event-bus/event-bus.service'
import { CarrierEventHandler } from '../event-handlers/carrier-event.handler'
import { ShopEventHandler } from '../event-handlers/shop-event.handler'
import { WmsEventHandler } from '../event-handlers/wms-event.handler'
import { SyncPreference } from '../sync-preferences/entities/sync-preference.entity'
import { SyncPreferencesService } from '../sync-preferences/sync-preferences.service'
import { CreateEventTriggerDto } from './dtos/create-event-trigger.dto'
import { RetryEventService } from './retry-event.service'

@Injectable()
export class EventTriggerService implements OnModuleInit {
  private readonly logger = new Logger(EventTriggerService.name)
  private sftpDedicatedTopic = 'sftp-messages'

  constructor(
    private eventBus: EventBusService,
    private shopEventRouter: ShopEventHandler,
    private wmsEventRouter: WmsEventHandler,
    private syncPrefService: SyncPreferencesService,
    private readonly consumerService: ConsumerService,
    private retryEventService: RetryEventService,
    private connectionAuthService: ConnectionAuthsService,
    private carrierEventRouter: CarrierEventHandler,
  ) {}

  async onModuleInit() {
    try {
      await this.consumerService.consume(
        { topic: this.sftpDedicatedTopic },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'data-migration' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'order' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'inventory-item' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'outbound-shipment' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'error' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'inbound-notice' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'inbound-receipt' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'return-shipment' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: EntityEnum.returnRequest },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: EntityEnum.refundOrder },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: EntityEnum.connectionAuth },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              const isReRouted = await this.reRouteMessageToDedicatedTopic(payload, topic)
              if (isReRouted) {
                return
              }

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

      await this.consumerService.consume(
        { topic: 'tracking' },
        {
          eachMessage: async ({ topic, partition, message }) => {
            let triggerId: string
            try {
              const payload = JSON.parse(message.value.toString()) as EventPayload
              triggerId = payload.trigger_id

              this.logger.log(
                `Consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`
              )
              await this.consumeEventTrigger(payload)
            } catch (err) {
              this.logger.error({
                message: `Error consuming message from topic: ${topic} and partition: ${partition} with offset: ${message.offset} and trigger_id: ${triggerId}`,
                data: err.message ? err.message : err
              })
            }
          }
        }
      )

    } catch (err) {
      this.logger.error(err, err?.stack)
    }
  }

  private async reRouteMessageToDedicatedTopic(
    eventPayload: EventPayload,
    topic: string
  ): Promise<boolean> {
    if (topic === this.sftpDedicatedTopic || eventPayload.data.is_cron) {
      return false
    }

    try {
      const connAuth = await this.connectionAuthService.findByImplementationIdAndTargetType(
        eventPayload.data.implementationId,
        eventPayload.data.target
      )

      if (connAuth.authStrategy === 'sftp.password') {
        this.logger.log({
          message: 'Rerouting message to SFTP dedicated topic',
          data: eventPayload
        })
        await this.eventBus.publishEvent(this.sftpDedicatedTopic, eventPayload)
        return true
      }

      return false
    } catch (err) {
      if (err instanceof BadRequestException) {
        this.logger.warn({
          message: 'No connAuth found',
          eventPayloadData: JSON.stringify(eventPayload)
        })
      } else {
        this.logger.error(err, err?.stack)
      }
      return false
    }
  }

  async createEventTrigger(
    data: CreateEventTriggerDto,
    isCron: boolean = false,
    isSftp: boolean = false,
    userHeaders?: JwtUser
  ) {
    try {
      await checkForUnauthorizedAccess(userHeaders, data.implementationId)

      let payload: EventPayload = {
        trigger_id: randomUUID(),
        logged_at: new Date(),
        data: { ...data, is_cron: isCron }
      }
      let syncPref = await this.syncPrefService.findOneByFilter(this.getFilterObj(data))

      if (this.shouldCreateEventTrigger(syncPref, isCron, payload.data)) {
        this.logger.log({ message: 'creating event', createEventData: payload })
        let topic = data.entity
        if (isSftp) {
          topic = 'sftp-messages'
        }

        await this.eventBus.publishEvent(topic, payload)
      }
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async consumeEventTrigger(payload: EventPayload) {
    const startTime = new Date().getTime()
    this.logger.log({
      message: `processing consumed event triggerId ${payload.trigger_id} for ${payload.data.entity}.${payload.data.action} and implementationId: ${payload.data.implementationId}`
    })
    let status = 'failed'
    let retryReason = ''
    let message = JSON.parse(JSON.stringify(payload.data))
    try {
      let syncPref = await this.syncPrefService.findOneByFilter(this.getFilterObj(message))

      if (!syncPref || syncPref.isActive) {
        switch (message.target) {
          case OrgType.Shop:
            await this.shopEventRouter.route(message)
            status = 'success'
            break
          case OrgType.Wms:
            await this.wmsEventRouter.route(message)
            status = 'success'
            break
          case OrgType.WmsThirdPartyIntegration:
            await this.wmsEventRouter.route(message)
            status = 'success'
            break
          case OrgType.Carrier:
            await this.carrierEventRouter.route(message)
            status = 'success'
            break
          default:
            throw new Error('no matching target found')
        }

        if (syncPref?.isActive) {
          this.syncPrefService.update(syncPref.id, { lastRanAt: new Date() })
        }
      }
      const endTime = new Date().getTime()
      const processingTime = endTime - startTime
      this.logger.log({
        message: `event processing ${status} for triggerId ${payload.trigger_id} for ${payload.data.entity}.${payload.data.action} and implementationId: ${payload.data.implementationId}`,
        data: {
          processingTime: processingTime
        }
      })
      return Promise.resolve()
    } catch (err) {
      this.logger.error({
        message: `event processing ${status} for trigger_id: ${payload.trigger_id} and implementationId: ${message.implementationId}`,
        eventTriggerErrorData: err.stack ? err.stack : 'no stack trace'
      })
      retryReason = err.message ? err.message : ''

      if (err instanceof BadRequestException) {
        this.logger.warn(err)
      } else {
        this.logger.error(err, err?.stack)
      }
    } finally {
      try {
        await this.retryEventService.createOrUpdate(message, status, retryReason)
      } catch (err) {
        this.logger.error(err)
      }
    }
  }

  shouldCreateEventTrigger(syncPref: SyncPreference, isCron: boolean, payloadData) {
    if (!isCron) {
      return true
    }

    if (!syncPref) {
      return true
    }

    if (!syncPref.isActive) {
      return false
    }

    if (payloadData?.retryEventId) {
      return true
    }

    if (!syncPref.lastRanAt) {
      return true
    }

    if (!syncPref?.frequency) {
      this.logger.log(
        `sync preference frequency value is not set for target: ${syncPref.target} and implementationId: ${syncPref.implementationId}`
      )
      return false
    }


    const nextExecutionPref = new Date(syncPref.frequency).getTime()
    const lastRanAt = new Date(syncPref.lastRanAt).getTime()

    if (syncPref.isActive && lastRanAt < nextExecutionPref) {
      return true
    }

    return false
  }

  private getFilterObj(data: CreateEventTriggerDto) {
    return {
      implementationId: data.implementationId,
      entity: data.entity,
      action: data.action,
      target: data.target
    }
  }
}
