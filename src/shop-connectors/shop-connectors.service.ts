import {
  CalculateRefundOrderDto,
  CalculateRefundOrderResponseDto,
  JwtUser,
  OrgType,
  RefundOrder,
  Role,
  TargetSystemEnum
} from '../core/types/common.types'
import { BadRequestException, Inject, Injectable, Logger, Scope, forwardRef } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'
import { AutomationEngineService } from '../automation/automation-engine.service'
import { ConnectionAuth } from '../connection-auths/entities/connection-auth.entity'
import { ConnectionPoolService } from '../connection-pool/connection-auth-pool.service'
import { KeyObjectInterface } from '../connection-pool/interfaces/connection-auth-pool.interface'
import { isEmpty } from '../core/utils/is-empty.utils'
import { QueryEmailSummaryDto } from '../email-summary/dto/query.email-summary.dto'
import { EmailSummaryTrackService } from '../email-summary/email-summary-track.service'
import { EmailSummaryService } from '../email-summary/email-summary.service'
import { RoutedMessage } from '../event-handlers/interfaces/routed-message.interface'
import { FieldMapper } from '../field-mapper/entities/field-mapper.entity'
import { QueryFieldMapper } from '../field-mapper/interfaces/query-field-mapper.interface'
import { ImplementationsService } from '../implementations/implementations.service'
import { InventoryItemsService } from '../inventory-items/inventory-items.service'
import { OrdersService } from '../orders/orders.service'
import { RefundOrdersService } from '../refund-orders/refund-orders.service'
import GetInventoryItemShopStockLevelsResponseDto from '../shop/dtos/get-inventory-item-shop-stock-levels-response.dto'
import { ShopConnectorsServiceInterface } from './shop-connectors.interface'
import { ShopifyService } from './shopify/shopify.service'
import { AttachIsShippingMethodUnknownUtil } from './utils/attach-is-shipping-method-unkown.utils'

export const ShopServiceMapperFields = {
  paymentMethod: 'payment_method',
  shippingMethod: 'shipping_method',
  carrier: 'carrier',
  returnReason: 'return_reason'
}

@Injectable({ scope: process.env.NODE_ENV === 'pact' ? Scope.DEFAULT : Scope.TRANSIENT })
export class ShopConnectorsService {
  private readonly logger = new Logger(ShopConnectorsService.name)

  concreteShopService: ShopConnectorsServiceInterface
  connection: ConnectionAuth

  constructor(
    private automationEngineService: AutomationEngineService,
    private implementationService: ImplementationsService,
    private inventoryItemsService: InventoryItemsService,
    private refundOrdersService: RefundOrdersService,
    @Inject(forwardRef(() => ShopifyService)) private shopifyService: ShopifyService,

    private emailSummaryService: EmailSummaryService,
    private readonly emailSummaryTrackService: EmailSummaryTrackService,
    private connectionAuthPoolService: ConnectionPoolService,
    private ordersService: OrdersService,
  ) { }

  async getOrders(message?: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      let orders = await this.concreteShopService.getOrders(message)
      await this.automationEngineService.executeRules(message, orders)
      await AttachIsShippingMethodUnknownUtil.attachIsShippingMethodUnknownInOrders(
        orders,
        message.implementationId
      )
      const result = await this.concreteShopService.sendOrdersToMiddleware(orders, message)

      return Promise.resolve(result)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async getInventoryItems(message?: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      const data = await this.concreteShopService.getInventoryItems(message)
      const inventoryItems = data?.inventoryItems || []
      const plInventoryItems = data?.plInventoryItems || []
      const products = data?.products || []
      await this.automationEngineService.executeRules(message, { inventoryItems, plInventoryItems })
      const result = await this.concreteShopService.sendInventoryItemsToMiddleware(
        inventoryItems,
        plInventoryItems,
        message,
        products
      )

      return Promise.resolve(result)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async createShipments(message?: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      await this.automationEngineService.executeRules(message)
      await this.concreteShopService.createShipments(message)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async updateInventoryLevels(message?: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      await this.automationEngineService.executeRules(message)
      let inventoryLevels = await this.concreteShopService.updateInventoryLevels(message)
      return Promise.resolve(inventoryLevels)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async syncInventoryItemGid(message?: RoutedMessage): Promise<any> {
    try {
      await this.shopifyService.syncInventoryItemGid(message)
      return
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async syncFulfillmentOrdersGid(message?: RoutedMessage): Promise<any> {
    try {
      await this.shopifyService.syncFulfillmentOrdersGid(message)
      return
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async updateCancelledOrders(message?: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      await this.automationEngineService.executeRules(message)
      await this.concreteShopService.updateCancelledOrders(message)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async updateOpenedOrders(message?: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      await this.automationEngineService.executeRules(message)
      await this.concreteShopService.updateOpenedOrders(message)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async createReturnShipments(message?: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      await this.automationEngineService.executeRules(message)
      await this.concreteShopService.createReturnShipments(message)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async createInboundReceipts(message?: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      await this.automationEngineService.executeRules(message)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async trackLowStockItems(message?: RoutedMessage): Promise<any> {
    try {
      await this.emailSummaryTrackService.trackLowStockItems(message)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async updateOnHoldEmailSummaryNotification(message?: RoutedMessage): Promise<any> {
    try {
      await this.emailSummaryTrackService.updateOnHoldEmailSummaryNotification(message)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async emailSummaryNotification(message?: RoutedMessage): Promise<any> {
    try {
      await this.sendEmailSummaryNotification(message)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  private async sendEmailSummaryNotification(message?: RoutedMessage) {
    let user: JwtUser = {
      id: 0,
      email: 'system@demo.com',
      role: Role.ShopUser,
      entityRole: Role.ShopUser,
      entityId: message?.targetTypeId,
      implementationId: message?.implementationId || 0,
      implementationIds: `${message?.implementationId}`
    }

    try {
      let implementationData = await lastValueFrom(
        this.implementationService.getImplementation(message?.implementationId, user)
      )
      let nosCustomerId = implementationData?.customer?.nosCustomerCompanyId

      if (isEmpty(nosCustomerId)) {
        this.logger.log(`No company id was found for ${implementationData.customer.companyName}`)
        return Promise.resolve()
      }

      const notificationType = this.emailSummaryService.getNotificationType()
      const filter: QueryEmailSummaryDto = {
        implementationId: message.implementationId,
        action: message.action as any,
        entity: message.entity as any,
        notificationType: notificationType
      }

      let emailSummaries = await this.emailSummaryService.findAll(filter, user)

      if (isEmpty(emailSummaries)) {
        this.logger.log(
          `No email summary was found for companyName: ${implementationData.customer.companyName}`
        )
        return Promise.resolve()
      }

      for (let emailSummary of emailSummaries) {
        await this.emailSummaryService.sendEmailSummaryMail(emailSummary, user)
      }

      this.logger.log(
        `Email summary notification sent for nos-customer-company-id: ${nosCustomerId}`
      )
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async calculateRefundOrder(
    refundOrderDto: CalculateRefundOrderDto
  ): Promise<CalculateRefundOrderResponseDto> {
    try {
      const calculateRefundOrderResponse =
        await this.refundOrdersService.calculateRefundOrder(refundOrderDto as any)

      await this.setupConnection({
        implementationId: refundOrderDto.implementationId,
        target: OrgType.Shop
      })
      const response = await this.concreteShopService.calculateRefundOrder(
        refundOrderDto,
        calculateRefundOrderResponse
      )
      return Promise.resolve(response)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async createRefundOrder(
    refundOrderDto: CalculateRefundOrderResponseDto
  ): Promise<RefundOrder | null> {
    try {
      await this.setupConnection({
        implementationId: refundOrderDto.refundOrder.implementationId,
        target: OrgType.Shop
      })

      const response = await this.concreteShopService.createRefundOrder(refundOrderDto, true)
      if (!response) {
        this.logger.warn(
          `failed to create refund order for orderId: ${refundOrderDto.refundOrder.orderId} and implementationId: ${refundOrderDto.refundOrder.implementationId}`
        )
        return null
      }

      if ('legacyId' in response) {
        refundOrderDto.refundOrder.customerRefundId = response?.legacyId?.toString()
        refundOrderDto.refundOrder.metaInfo = {
          shopify_refund_gid: response.id
        }
      } else {
        refundOrderDto.refundOrder.customerRefundId = response?.id.toString()
      }

      const createdRefundOrder =
        await this.refundOrdersService.createRefundOrderAfterRefundCalculation(refundOrderDto as any as any)
      return Promise.resolve(createdRefundOrder)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async createRefundOrders(message: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      const response = await this.concreteShopService.createRefundOrders(message)
      return Promise.resolve(response)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async getShopDetails(message: RoutedMessage): Promise<any> {
    try {
      await this.setupConnection(message)
      const response = await this.concreteShopService.getShopDetails(message)
      return Promise.resolve(response)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async releaseOrders(
    message?: RoutedMessage<{ delayOrderReleaseInMinutes: number }>
  ): Promise<void> {
    try {
      const { implementationId } = message
      const { delayOrderReleaseInMinutes } = message.data

      this.logger.log(`processing orders release of impl id: ${message.implementationId}`)

      const user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        entityId: message.targetTypeId,
        entityRole: OrgType.Shop as any,
        implementationId: implementationId,
        implementationIds: String(implementationId)
      }

      this.ordersService.releaseOrders(
        {
          implementationId: implementationId,
          delayOrderReleaseInMinutes: delayOrderReleaseInMinutes
        },
        user
      )
      return Promise.resolve()
    } catch (e) {
      this.logger.error(e, e?.stack)
      throw e
    }
  }

  async getShippingMethod(queryFieldMapper: QueryFieldMapper): Promise<FieldMapper[]> {
    try {
      const { implementationId } = queryFieldMapper
      if (!implementationId) return Promise.resolve([])
      await this.setupConnection({ implementationId: implementationId, target: OrgType.Shop })
      const response = await this.concreteShopService.getShippingMethod(queryFieldMapper)
      return Promise.resolve(response)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async getInventoryItemShopStockLevels(
    inventoryItemId: number,
    user: JwtUser
  ): Promise<GetInventoryItemShopStockLevelsResponseDto> {
    const inventoryItem = await lastValueFrom(
      this.inventoryItemsService.getInventoryItem(inventoryItemId, user)
    )
    const connectionAuth = await this.connectionAuthPoolService.getConnectionPool({
      implementationId: inventoryItem.implementationId,
      target: OrgType.Shop
    })

    await this.setupConnection({
      implementationId: inventoryItem.implementationId,
      target: OrgType.Shop
    })

    const shopStockInfo = await this.concreteShopService.getInventoryItemShopStockLevels(
      inventoryItem,
      connectionAuth
    )

    this.logger.log(
      `[getInventoryItemShopStockLevels] shopStockInfo for inventoryItemId: ${inventoryItemId} is: ${JSON.stringify(shopStockInfo)}`
    )

    return shopStockInfo
  }

  private async setupConnection(message: RoutedMessage | KeyObjectInterface): Promise<void> {
    try {
      const connectionAuth = (await this.connectionAuthPoolService.getConnectionPool(
        message
      )) as ConnectionAuth

      switch (connectionAuth.targetSystem) {
        case TargetSystemEnum.SHOPIFY:
          this.concreteShopService = this.shopifyService
          break
        default:
          throw new BadRequestException(
            `no matching shop targetSystem: ${connectionAuth.targetSystem} found.`
          )
      }

    } catch (err) {
      throw err
    }
  }
}
