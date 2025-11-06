import {
  ActionEnum,
  EntityEnum,
  InboundNotice,
  InventoryItem,
  OrgType
} from '../core/types/common.types'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { mainConfigs } from '../config/config'
import { RetryEventStatusEnum } from '../core/enums/retry-event-status.enum'
import { RoutedMessage } from '../event-handlers/interfaces/routed-message.interface'
import { CreateShipmentDto } from '../shop-connectors/dtos/create-shipment.dto'
import { RetryEvent } from './entities/retry-event.entity'

@Injectable()
export class RetryEventService {
  private readonly logger = new Logger(RetryEventService.name)

  constructor(@InjectRepository(RetryEvent) private retryEventRepository: Repository<RetryEvent>) {}

  private canRetry(message: RoutedMessage): void {
    let matchString = `${message.action}_${message.entity}_${message.target}`
    switch (matchString) {
      case `${ActionEnum.getMany}_${EntityEnum.order}_${OrgType.Shop}`:
        this.setMaxAllowedRetry(message, mainConfigs.orderMaxAllowedRetry)
        break
      case `${ActionEnum.updateMany}_${EntityEnum.inventoryItem}_${OrgType.Shop}`:
        this.setMaxAllowedRetry(message, mainConfigs.inventoryLevelMaxAllowedRetry)
        break
      case `${ActionEnum.create}_${EntityEnum.outboundShipment}_${OrgType.Shop}`:
        this.setMaxAllowedRetry(message, mainConfigs.maxAllowedRetry)
        break
      case `${ActionEnum.open}_${EntityEnum.order}_${OrgType.Shop}`:
        this.setMaxAllowedRetry(message, mainConfigs.maxAllowedRetry)
        break
      case `${ActionEnum.cancel}_${EntityEnum.order}_${OrgType.Shop}`:
        this.setMaxAllowedRetry(message, mainConfigs.maxAllowedRetry)
        break
      case `${ActionEnum.create}_${EntityEnum.inventoryItem}_${OrgType.Wms}`:
        this.setMaxAllowedRetry(message, mainConfigs.maxAllowedRetry)
        break
      case `${ActionEnum.create}_${EntityEnum.inboundNotice}_${OrgType.Wms}`:
        this.setMaxAllowedRetry(message, mainConfigs.maxAllowedRetry)
        break
      case `${ActionEnum.create}_${EntityEnum.returnRequest}_${OrgType.Wms}`:
        this.setMaxAllowedRetry(message, mainConfigs.maxAllowedRetry)
        break
    }
  }

  private setMaxAllowedRetry(message: RoutedMessage, maxAllowedRetry: number): void {
    if (!message.maxAllowedRetry) {
      message.maxAllowedRetry = maxAllowedRetry
      message.retryCount = 0
    }
  }

  async createOrUpdate(message: RoutedMessage, status: string, reason: string): Promise<void> {
    try {
      this.canRetry(message)
      if (!message.data) return
      if (!message.maxAllowedRetry) return
      if (status === 'success' && !message.data?.retryInfo && !message.retryEventId) return

      if (status === 'success' && message.data?.retryInfo && message.retryEventId) {
        const isMatched = await this.checkIfDataAndRetryInfoMatch(message)
        if (isMatched) {
          await this.update(message)
        } else {
          await this.updateStatus([message.retryEventId], RetryEventStatusEnum.completed)
          await this.create(message, reason ? reason : `retry ${message.action} ${message.entity}`)
        }
      }

      if (status === 'success' && message.data?.retryInfo && !message.retryEventId) {
        await this.create(message, reason ? reason : `retry ${message.action} ${message.entity}`)
      }

      if (status === 'success' && !message.data?.retryInfo && message.retryEventId) {
        await this.updateStatus([message.retryEventId], RetryEventStatusEnum.completed)
      }

      if (status === 'failed' && !message.data?.retryInfo && !message.retryEventId) {
        await this.create(
          message,
          reason ? reason : `retry failed ${message.action} ${message.entity}`
        )
      }

      if (status === 'failed' && !message.data?.retryInfo && message.retryEventId) {
        await this.update(message)
      }
      return Promise.resolve()
    } catch (err) {
      throw err
    }
  }

  async create(message: RoutedMessage, retryReason: string): Promise<void> {
    try {
      let newMessage: RoutedMessage = JSON.parse(JSON.stringify(message))
      if (newMessage.data?.retryInfo) {
        let retryInfo = JSON.parse(JSON.stringify(newMessage.data.retryInfo))
        delete newMessage.data.retryInfo
        newMessage.data = {
          ...newMessage.data,
          ...retryInfo
        }

        if (Array.isArray(retryInfo)) {
          newMessage.data = retryInfo
        }
      }
      let retryEvent: RetryEvent = this.retryEventRepository.create({
        ...newMessage,
        retryCount: 0,
        status: RetryEventStatusEnum.open,
        nextRetryTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
        retryReason
      })
      this.logger.log({ message: 'created retryEvent', createdRetryEvent: retryEvent })
      await this.retryEventRepository.save(retryEvent)
    } catch (err) {
      throw err
    }
  }

  async update(message: RoutedMessage): Promise<void> {
    try {
      let retryEvent: RetryEvent = await this.retryEventRepository.findOneOrFail({
        where: { id: message.retryEventId }
      })
      retryEvent.status =
        retryEvent.retryCount === retryEvent.maxAllowedRetry
          ? RetryEventStatusEnum.dead
          : RetryEventStatusEnum.open
      if (retryEvent.retryCount < retryEvent.maxAllowedRetry) {
        this.getNextRetryTime(retryEvent)
      }
      this.logger.log({
        message: 'updated retryEvent',
        retryEvent: { id: retryEvent.id, retryCount: retryEvent.retryCount }
      })
      await this.retryEventRepository.save(retryEvent)
    } catch (err) {
      throw err
    }
  }

  async updateStatus(ids: Array<number>, status: string): Promise<void> {
    try {
      if (!ids.length) {
        this.logger.log({ message: 'no ids to update', ids })
        return
      }
      if (!(status in RetryEventStatusEnum)) throw 'invalid retryEvent status passed'

      let updateObj = {
        status: status as RetryEventStatusEnum
      }

      if (status === RetryEventStatusEnum.processing) {
        updateObj['retryCount'] = () => 'retry_event.retry_count + 1'
      }

      await this.retryEventRepository.update({ id: In(ids) }, updateObj)
      this.logger.log({
        message: 'status update of retryEvents',
        updateStatusData: { ids, status }
      })
    } catch (err) {
      throw err
    }
  }

  async findByFilter(queryDto: Partial<RetryEvent>): Promise<RetryEvent[]> {
    try {
      return await this.retryEventRepository.find({
        where: {
          ...queryDto
        }
      })
    } catch (err) {
      throw err
    }
  }

  async findById(id: number): Promise<RetryEvent> {
    try {
      return await this.retryEventRepository.findOneOrFail({ where: { id } })
    } catch (err) {
      throw err
    }
  }

  private async checkIfDataAndRetryInfoMatch(message: RoutedMessage): Promise<boolean> {
    try {
      let matchString = `${message.action}_${message.entity}_${message.target}`
      switch (matchString) {
        case `${ActionEnum.getMany}_${EntityEnum.order}_${OrgType.Shop}`:
          let previousCustomerOrderIds = message?.data?.customerOrderIds.slice()
          let newCustomerOrderIds = message?.data?.retryInfo?.customerOrderIds.slice()

          if (previousCustomerOrderIds.length !== newCustomerOrderIds.length) return false

          let idsObj: Record<string, number> = {}
          for (let id of previousCustomerOrderIds) {
            idsObj[id] = 1
          }
          for (let id of newCustomerOrderIds) {
            if (!idsObj[id]) return false
          }
          return true

        case `${ActionEnum.open}_${EntityEnum.order}_${OrgType.Shop}`: {
          return await this.checkIfDataAndRetryInfoMatchForOpenOrderEvent(message)
        }

        case `${ActionEnum.create}_${EntityEnum.outboundShipment}_${OrgType.Shop}`: {
          return await this.checkIfDataAndRetryInfoMatchForCreateShipmentEvent(message)
        }

        case `${ActionEnum.cancel}_${EntityEnum.order}_${OrgType.Shop}`: {
          return await this.checkIfDataAndRetryInfoMatchForCancelOrderEvent(message)
        }

        case `${ActionEnum.create}_${EntityEnum.inventoryItem}_${OrgType.Wms}`: {
          return await this.checkIfDataAndRetryInfoMatchForCreateInventoryItemEvent(message)
        }

        case `${ActionEnum.create}_${EntityEnum.inboundNotice}_${OrgType.Wms}`: {
          return await this.checkIfDataAndRetryInfoMatchForCreateInboundNoticeEvent(message)
        }

        default:
          return false
      }
    } catch (err) {
      throw err
    }
  }

  private async checkIfDataAndRetryInfoMatchForCreateInboundNoticeEvent(
    message: RoutedMessage
  ): Promise<boolean> {
    try {
      let retryEvent: RetryEvent = await this.retryEventRepository.findOneOrFail({
        where: { id: message.retryEventId }
      })
      let oldInboundNotices = retryEvent.data as any as InboundNotice[]
      let currInboundNotices = message?.data?.retryInfo?.slice()

      if (oldInboundNotices.length != currInboundNotices.length) return false

      let inboundNoticeIdsObj: Record<string, number> = {}

      for (let oldInboundNotice of oldInboundNotices || []) {
        inboundNoticeIdsObj[oldInboundNotice.id] = 1
      }

      for (let currInboundNotice of currInboundNotices || []) {
        if (!inboundNoticeIdsObj[currInboundNotice.id]) return false
      }

      return true
    } catch (err) {
      throw err
    }
  }

  private async checkIfDataAndRetryInfoMatchForCreateInventoryItemEvent(
    message: RoutedMessage
  ): Promise<boolean> {
    try {
      let retryEvent: RetryEvent = await this.retryEventRepository.findOneOrFail({
        where: { id: message.retryEventId }
      })
      let oldInventoryItems = retryEvent.data as any as InventoryItem[]
      let currInventoryItems = message?.data?.retryInfo?.slice()

      if (oldInventoryItems.length != currInventoryItems.length) return false

      let inventoryItemIdsObj: Record<string, number> = {}

      for (let oldInventoryItem of oldInventoryItems || []) {
        inventoryItemIdsObj[oldInventoryItem.id] = 1
      }

      for (let currInventoryItem of currInventoryItems || []) {
        if (!inventoryItemIdsObj[currInventoryItem.id]) return false
      }

      return true
    } catch (err) {
      throw err
    }
  }

  private async checkIfDataAndRetryInfoMatchForCancelOrderEvent(
    message: RoutedMessage
  ): Promise<boolean> {
    try {
      let retryEvent: RetryEvent = await this.retryEventRepository.findOneOrFail({
        where: { id: message.retryEventId }
      })
      let oldOrderDetails = retryEvent.data?.['orderDetails']?.slice() || []
      let oldRefundOrders = retryEvent.data?.['refundOrders']?.slice() || []

      let currOrderDetails = message?.data?.retryInfo?.orderDetails?.slice() || []
      let currRefundOrders = message?.data?.retryInfo?.refundOrders?.slice() || []

      if (
        oldOrderDetails.length !== currOrderDetails.length ||
        oldRefundOrders.length !== currRefundOrders.length
      )
        return false

      let orderIdsOrderDetailsObj: Record<string, number> = {}
      let orderIdsRefundOrdersObj: Record<string, number> = {}

      for (let oldOrderDetail of oldOrderDetails) {
        orderIdsOrderDetailsObj[oldOrderDetail.orderId] = 1
      }
      for (let oldRefundOrder of oldRefundOrders) {
        orderIdsRefundOrdersObj[oldRefundOrder.orderId] = 1
      }

      for (let currOrderDetail of currOrderDetails) {
        if (!orderIdsOrderDetailsObj[currOrderDetail.orderId]) return false
      }
      for (let currRefundOrder of currRefundOrders) {
        if (!orderIdsRefundOrdersObj[currRefundOrder.orderId]) return false
      }

      return true
    } catch (err) {
      throw err
    }
  }

  private async checkIfDataAndRetryInfoMatchForOpenOrderEvent(
    message: RoutedMessage
  ): Promise<boolean> {
    try {
      let retryEvent: RetryEvent = await this.retryEventRepository.findOneOrFail({
        where: { id: message.retryEventId }
      })
      let oldCustomerOrderIds = retryEvent.data?.['customerOrderIds']?.slice()
      let oldFulfillmentOrderIds = retryEvent.data?.['fulfillmentOrderIds']?.slice()

      let currCustomerOrderIds = message?.data?.retryInfo?.customerOrderIds?.slice()
      let currFulfillmentOrderIds = message?.data?.retryInfo?.fulfillmentOrderIds?.slice()

      if (
        oldCustomerOrderIds.length !== currCustomerOrderIds.length ||
        oldFulfillmentOrderIds.length !== currFulfillmentOrderIds.length
      )
        return false

      let customerOrderIdsObj: Record<string, number> = {}
      let fulfillmentOrderIdsObj: Record<string, number> = {}
      for (let id of oldCustomerOrderIds) {
        customerOrderIdsObj[id] = 1
      }
      for (let id of oldFulfillmentOrderIds) {
        fulfillmentOrderIdsObj[id] = 1
      }

      for (let id of currCustomerOrderIds) {
        if (!customerOrderIdsObj[id]) return false
      }
      for (let id of currFulfillmentOrderIds) {
        if (!fulfillmentOrderIdsObj[id]) return false
      }

      return true
    } catch (err) {
      throw err
    }
  }

  private async checkIfDataAndRetryInfoMatchForCreateShipmentEvent(
    message: RoutedMessage
  ): Promise<boolean> {
    try {
      let retryEvent: RetryEvent = await this.retryEventRepository.findOneOrFail({
        where: { id: message.retryEventId }
      })
      let oldOutboundShipments = retryEvent.data as any as CreateShipmentDto[]
      let currOutboundShipments = message?.data?.retryInfo?.slice()

      if (oldOutboundShipments.length != currOutboundShipments.length) return false

      let outboundShipmentIdsObj: Record<string, number> = {}

      for (let info of oldOutboundShipments || []) {
        outboundShipmentIdsObj[info.outboundShipment.id] = 1
      }

      for (let info of currOutboundShipments || []) {
        if (!outboundShipmentIdsObj[info.outboundShipment.id]) return false
      }

      return true
    } catch (err) {
      throw err
    }
  }

  private getNextRetryTime(retryEvent: RetryEvent): void {
    try {
      if (retryEvent.retryCount < mainConfigs.retryFrequencyIncrementThreshold) {
        retryEvent.nextRetryTime = new Date(
          new Date().getTime() + (retryEvent.retryCount + 1) * 60 * 60 * 1000
        )
        return
      }
      retryEvent.nextRetryTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    } catch (err) {
      throw err
    }
  }
}
