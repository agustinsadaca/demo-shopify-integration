import {
  CalculateRefundOrderDto,
  CalculateRefundOrderResponseDto,
  CreateInventoryItemDto,
  CreateOrderDto,
  CreatePartnerLocationInventoryItemDto,
  EntityEnum,
  EventType,
  Implementation,
  InventoryBundle,
  InventoryItem,
  InventoryLevelType,
  InventoryLevelTypeSkuImplementation,
  MetaInfoOrder,
  MetaInfoOrderItem,
  Order,
  OrgType,
  OutboundShipment,
  PartnerLocationInventoryItem,
  PutOrderGidDto,
  Role,
  ShopifyGraphQLId,
  ShopifyResources,
  TargetSystemEnum
} from './entities'
import { JwtUser } from '../../core/types/common.types'
import { Pagination } from './utils/pagination'
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { lastValueFrom } from 'rxjs'
import { In, Repository } from 'typeorm'
import { mainConfigs } from '../../config/config'
import { ConnectionAuthsService } from '../../connection-auths/connection-auths.service'
import { CreateConnectionAuthDto, CreateShopifyIntregrationDto } from '../../connection-auths/dtos/create-connection-auth.dto'
import { ConnectionAuth } from '../../connection-auths/entities/connection-auth.entity'
// ConnectionPoolService removed - not available in this project
import { TargetSync } from '../../core/entities/target-sync.entity'
import { CancelledOrderDetails } from '../../core/interfaces/cancelled-order-details.interface'
import {
  ConnectionAuthMetaInfo,
  ShopifyPlan
} from '../../core/interfaces/connection-auth-meta-info.interface'
import { RateLimitConfig } from '../../core/interfaces/rate-limit-config.enum'
import {
  UpdateCancelledOrdersData,
  UpdateCancelledOrdersDataRetryData
} from '../../core/interfaces/update-cancelled-orders-data.interface'
import { TargetSyncService } from '../../core/target-sync.service'
import { RoutedMessage } from '../../event-handlers/interfaces/routed-message.interface'
import { ConnectorUtils } from '../../event-handlers/utils/connector.util'
import { CreateEventTriggerDto } from '../../event-trigger/dtos/create-event-trigger.dto'
import { EventTriggerService } from '../../event-trigger/event-trigger-service'
import { FieldMapper } from '../../field-mapper/entities/field-mapper.entity'
import { FieldMapperService } from '../../field-mapper/field-mapper.service'
import { QueryFieldMapper } from '../../field-mapper/interfaces/query-field-mapper.interface'
import { ImplementationsService } from '../../implementations/implementations.service'
import { InventoryBundlesService } from '../../inventory-bundles/inventory-bundles.service'
import { InventoryItemsService } from '../../inventory-items/inventory-items.service'
import { InventoryLevelSourceService } from '../../inventory-level-source/inventory-level-source.service'
import { OrdersService } from '../../orders/orders.service'
import { OutboundShipmentsService } from '../../outbound-shipments/outbound-shipments.service'
import { RefundOrdersService } from '../../refund-orders/refund-orders.service'
import GetInventoryItemShopStockLevelsResponseDto, {
  IGetInventoryItemShopifyStockLevelsResponse
} from '../../shop/dtos/get-inventory-item-shop-stock-levels-response.dto'
import { CreateShipmentDto } from '../dtos/create-shipment.dto'
import { ShopConnectorsServiceInterface } from '../shop-connectors.interface'
import { ShopServiceMapperFields } from '../shop-connectors.service'
import { ALLOWED_EVENTS_SHOPIFY } from '../utils/allowed-events-for-inventory-level-update.util'
import { PartialCompletedGraphQLDto } from './dtos/partial-completed.dto'
import {
  EShopifyFulfillmentAssignmentStatus,
  QueryFulfillmentOrderMetaInfoDto,
  QueryShopifyGetOrderDto
} from './dtos/query-order.dto'
import { QueryProductDto, QueryProductMetaInfoDto } from './dtos/query-product.dto'
import { ShopifyCalculateRefundResponseGraphQLDto } from './dtos/shopify-calulate-refund-response.dto'
import { ShopifyCreateRefundResponseGraphQLDto } from './dtos/shopify-create-refund-response.dto'
import { ShopifyCreateRefundGraphQLDto } from './dtos/shopify-create-refund.dto'
import { ShopifyCredentialDto } from './dtos/shopify-credential.dto'
import {
  EShopifyFulfillmentOrderStatus,
  EShopifyFulfillmentSupportedActions,
  EShopifyRequestStatus,
  ShopifyFulfillmentOrderDetailsGraphQLDto,
  ShopifyFulfillmentOrderGraphQLDto
} from './dtos/shopify-fulfillment-order.dto'
import { ShopifyFulfillmentServiceDto } from './dtos/shopify-fulfillment-service.dto'
import { ShopifyInventoryItemGraphQLDto } from './dtos/shopify-inventory-item.dto'
import {
  ShopifyInventoryLevelGraphQlDto,
  ShopifyMultipleInventoryLevelGraphQlDto
} from './dtos/shopify-inventory-level.dto'
import { ShopifyGetSubscribedWebhooksDto } from './dtos/shopify-list-subscribed-webhooks.dto'
import { OrderMapGraphQL, OrderMapValuesGraphQL } from './dtos/shopify-order-map-dto'
import {
  EShopifyOrderDisplayFinancialStatus,
  ShopifyOrderGraphQLDto
} from './dtos/shopify-order.dto'
import { PageInfoDto } from './dtos/shopify-page-info.dto'
import { ShopifyProductImageDto } from './dtos/shopify-product-image.dto'
import {
  ShopifyProductVariantGraphQlDto,
  ShopifyProductVariantMetaInfoGraphQlDto
} from './dtos/shopify-product-variant.dto'
import { ShopifyProductDto } from './dtos/shopify-product.dto'
import { ShopifyShipmentGraphQLDto } from './dtos/shopify-shipment.dto'
import { ShopifyShippingLineGraphQLDto } from './dtos/shopify-shipping-line.dto'
import { ShopifySubscribeWebhookDto } from './dtos/shopify-subscribe-webhook.dto'
import { ShopifyUnSubscribeWebhookDto } from './dtos/shopify-unsubscribe-webhook.dto'
import {
  ShopifyInventoryStates,
  ShopifyInventoryUnavailableStates
} from './enums/shopify-inventory-states-enum'
import { ShopifyOrderCancelReason } from './enums/shopify-order-cancel-reason.enum'
import { SuggestedOrderTransactionKind } from './enums/shopify-refund-kind.enum'
import { ShopifyRestockType } from './enums/shopify-restock-type.enum'
import { FulfillmentServiceMapper } from './graphql-mappers/fulfillment-service.mapper'
import { GraphQLShopifyService } from './graphql-shopify.service'
import { HttpShopifyService } from './http-shopify.service'
import {
  UpdateOpenOrdersData,
  UpdateOpenOrdersDataRetryData
} from './interfaces/update-open-orders.interface'
import { MapperService } from './mapper.service'
import { GraphQlIdConverter } from './mappers/graphql-id-converter.mapper'
import { GraphQLMapperService } from './shopify-graphql-mapper.service'
import shopifyWebhookLogger from './shopify-webhook-logger'
import { shopifyPlanRateLimitConfig } from './shopify.config'

export const ShopifyEntityTypes = { order: 'order', inventory: 'inventory' }

type ShopifyFulfillmentServiceDetails = {
  name: string
  callbackUrl: string
  inventoryManagement: boolean
  trackingSupport: boolean
}

const CREATE_FULFILLMENT_SERVICE_GRAPHQL_PAYLOAD: ShopifyFulfillmentServiceDetails = {
  name: 'Demo Shopify Fulfillment',
  callbackUrl: 'https://api.demo-shopify.plus/shop',
  inventoryManagement: true,
  trackingSupport: true
} as const

interface ShopifyQuantities {
  committedQuantity: number
  unavailableQuantity: number
}

interface ShopifyQuantitiesForBundle {
  committedQuantity: number
  unavailableQuantity: number
  bundleQuantity: number
}

interface BundleQuantity {
  bundleId: string
  bundleSkuImplementation: string
  bundleQuantity: number
  shopifyCommitedQuantity: number
  shopifyUnavailableQuantity: number
}
@Injectable()
export class ShopifyService implements ShopConnectorsServiceInterface {
  private readonly logger = new Logger(ShopifyService.name)
  private readonly shopifyWebhookLogger = shopifyWebhookLogger
  mapperService: MapperService

  constructor(
    private ordersService: OrdersService,
    private implementationsService: ImplementationsService,
    private inventoryItemsService: InventoryItemsService,

    private graphQLShopifyService: GraphQLShopifyService,
    private targetSyncService: TargetSyncService,
    private shipmentService: OutboundShipmentsService,
    private graphQLMapperService: GraphQLMapperService,
    mapperService: MapperService,
    @Inject(forwardRef(() => EventTriggerService))
    private triggerService: EventTriggerService,
    private fieldMapperService: FieldMapperService,
    private refundOrdersService: RefundOrdersService,
    private connectionAuthsService: ConnectionAuthsService,
    private eventEmitter: EventEmitter2,
    // private connectionAuthPoolService: ConnectionPoolService, // Removed - not available
    private inventoryBundleService: InventoryBundlesService,
    private inventoryLevelSourceService: InventoryLevelSourceService,
    @InjectRepository(TargetSync)
    private targetSyncRepository: Repository<TargetSync>,
    @InjectRepository(ConnectionAuth)
    private connectionAuthRepository: Repository<ConnectionAuth>,
    private httpShopifyService: HttpShopifyService
  ) {
    this.mapperService = mapperService
  }

  private getUser(message: RoutedMessage): JwtUser {
    try {
      const user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        implementationId: message.implementationId,
        implementationIds: `${message.implementationId}`,
        entityRole: OrgType.Shop as any,
        entityId: message.targetTypeId
      }

      return user
    } catch (err) {
      throw err
    }
  }

  private async getImplementation(message: RoutedMessage): Promise<Implementation> {
    const user: JwtUser = this.getUser(message)
    return await lastValueFrom(
      this.implementationsService.getImplementation(message.implementationId, user)
    )
  }

  async sendOrdersToMiddleware(orders: Partial<Order>[], message: RoutedMessage): Promise<any> {
    try {
      if (!orders || !orders.length) return Promise.resolve()
      const user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        implementationId: message.implementationId,
        implementationIds: `${message.implementationId}`,
        entityRole: OrgType.Shop as any,
        entityId: message.targetTypeId
      }

      await lastValueFrom(this.ordersService.updateOrCreateOrders(orders as any, user))
      this.logger.log(
        `Successfully synced ${orders.length} orders for implementationId ${message.implementationId}`
      )
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  async sendInventoryItemsToMiddleware(
    inventoryItems: Partial<InventoryItem>[],
    plInventoryItems: Partial<PartnerLocationInventoryItem>[],
    message: RoutedMessage,
    products: any[] = []
  ): Promise<any> {
    try {
      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)
      if (!inventoryItems || !inventoryItems.length) return Promise.resolve()
      const user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        implementationId: message.implementationId,
        implementationIds: `${message.implementationId}`,
        entityRole: OrgType.Shop as any,
        entityId: message.targetTypeId
      }
      const createdOrUpdatedInventoryItems = await lastValueFrom(
        this.inventoryItemsService.updateOrCreateInventoryItems(
          inventoryItems,
          false,
          plInventoryItems,
          user
        )
      )
      await this.processLastSyncDate(
        connection,
        EntityEnum.inventoryItem,
        inventoryItems,
        'updatedAt'
      )
      this.logger.log({
        message: 'inventoryItems synced:',
        data: { inventoryItems: createdOrUpdatedInventoryItems.length }
      })
      return Promise.resolve(createdOrUpdatedInventoryItems)
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  async processLastSyncDate(
    connection: ConnectionAuth,
    entity: string,
    data: Array<any>,
    property: string
  ) {
    try {
      const lastSyncedAt = this.getLastSyncedAtFromResponse(data, property)
      await this.targetSyncService.setLastSyncedAt(entity, lastSyncedAt, connection.id, data.length)
    } catch (err) {
      throw err
    }
  }

  getLastSyncedAtFromResponse(response: Array<any>, dateFieldName: string): Date {
    let lastSyncedDate = new Date()
    const lastElement = ConnectorUtils.getLastByDate(response, dateFieldName)

    if (lastElement !== undefined && lastElement[dateFieldName] !== undefined) {
      lastSyncedDate = new Date(lastElement[dateFieldName])
    }

    return lastSyncedDate
  }

  async sendShipmentsToShop(
    shipments: { dto: ShopifyShipmentGraphQLDto; info: any }[],
    message: RoutedMessage,
    failedShipments: CreateShipmentDto[]
  ): Promise<any> {
    try {
      if (!shipments || !shipments.length) return Promise.resolve()

      const jwtUser: JwtUser = this.getUser(message)
      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)

      for (let shipment of shipments) {
        try {
          const createdShipment = await lastValueFrom(
            this.graphQLShopifyService.createFulfillment(connection, {
              shopShipmentDto: shipment.dto
            })
          )
          this.logger.log({
            message: 'createdShipment',
            createdShipmentData: JSON.stringify(createdShipment)
          })
          try {
            await lastValueFrom(
              this.shipmentService.updateOutboundShipment(
                shipment.info?.outboundShipment?.id,
                { customerShipmentId: createdShipment.legacyResourceId },
                jwtUser
              )
            )
          } catch (error) {
            this.logger.error(error)
          }
        } catch (error) {
          failedShipments.push(shipment.info)
          this.logger.error(error)
        }
      }
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  async sendUpdatedInventoryLevelsToShop(
    inventoryItem: InventoryItem,
    inventoryLevel: InventoryLevelType[],
    manualNotConfirmedOrdersQty: number,
    eventType: EventType
  ): Promise<any> {
    try {
      const connection = await this.connectionAuthsService.getConnectionPool<OrgType.Shop>({
        implementationId: inventoryItem.implementationId,
        target: OrgType.Shop
      })
      const user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        implementationId: inventoryItem.implementationId,
        implementationIds: `${inventoryItem.implementationId}`,
        entityRole: OrgType.Shop as any,
        entityId: connection.targetTypeId
      }

      const implementation = await lastValueFrom(
        this.implementationsService.getImplementation(inventoryItem.implementationId, user)
      )

      if (implementation && !implementation.customerLocationId) {
        const message: string = `customerLocationId does not exist for implementationId: ${implementation.id}`
        this.logger.error(message)

        throw new Error(message)
      }

      const shopifyInventoryLevels = await lastValueFrom(
        this.graphQLShopifyService.getInventoryLevels(connection, {
          query: {
            locationId: implementation?.metaInfo.shopify_location_gid,
            inventoryItemId: inventoryItem.metaInfo.shopify_inventory_item_gid
          }
        })
      )

      if (!shopifyInventoryLevels) {
        this.logger.error(
          `Inventory item level is empty for sku: ${inventoryItem.sku} and customerItemId: ${inventoryItem.customerItemId}`
        )
        return Promise.resolve()
      }

      this.logger.log(
        `Shopify Inventory Levels for SKU: ${inventoryItem.sku}: ${shopifyInventoryLevels.quantities.map((q) => q.name + ':' + q.quantity).join(', ')}`
      )

      const productAvailableStockQuantity =
        shopifyInventoryLevels.quantities.find(
          (quantity) => quantity.name === ShopifyInventoryStates.AVAILABLE
        )?.quantity ?? 0
      let sellableQuantity = inventoryLevel?.[0]?.sellable ?? 0
      const physicalQuantity = inventoryLevel?.[0]?.physical ?? 0

      const shopifyCalculatedSellableQuantity = await this.calculateTotalSellableQuantity(
        shopifyInventoryLevels,
        inventoryItem,
        physicalQuantity,
        manualNotConfirmedOrdersQty,
        implementation,
        connection,
        user
      )

      this.logger.log(
        `Shopify quantities for SKU: ${inventoryItem.sku}: ${JSON.stringify(shopifyCalculatedSellableQuantity)}, physicalQuantity: ${physicalQuantity}, manualNotConfirmedOrdersQty: ${manualNotConfirmedOrdersQty}. EventType: ${eventType}`
      )

      if (eventType === EventType.inboundReceipt) {
        sellableQuantity += productAvailableStockQuantity
      } else {
        sellableQuantity = shopifyCalculatedSellableQuantity
      }

      const allowedEventsWithoutCalculation = ALLOWED_EVENTS_SHOPIFY.includes(eventType)
      if (!allowedEventsWithoutCalculation && productAvailableStockQuantity <= sellableQuantity) {
        this.logger.log(
          `Shop quantity for ${inventoryItem.sku} is less or equal than sellable quantity, shopQuantity:${productAvailableStockQuantity}, sellableQuantity:${sellableQuantity}, NOT UPDATING. EventType: ${eventType}`
        )
        return Promise.resolve()
      }
      const mappedItem = this.graphQLMapperService.mapTo(EntityEnum.inventoryLevel, {
        inventoryLevel: {
          id: inventoryItem.metaInfo.shopify_inventory_item_gid,
          sellableQuantity: sellableQuantity,
          locationId: implementation?.metaInfo.shopify_location_gid
        }
      })
      await lastValueFrom(
        this.graphQLShopifyService.updateInventoryLevel(connection, { query: mappedItem })
      )

      this.logger.log(
        `Update inventoryLevel done for sku: ${inventoryItem.sku}, shopQuantity:${productAvailableStockQuantity}, sellableQuantity:${sellableQuantity}, eventType: ${eventType}`
      )

      return Promise.resolve(inventoryItem)
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  async cancelFulfillmentAndOrder(
    connection: ConnectionAuth,
    fulfillmentOrderId: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
  ): Promise<ShopifyFulfillmentOrderDetailsGraphQLDto | null> {
    try {
      this.logger.log(`Cancelling fulfillment order for fulfillmentId ${fulfillmentOrderId}`)

      let fulfillmentOrderDetails: ShopifyFulfillmentOrderDetailsGraphQLDto = await lastValueFrom(
        this.graphQLShopifyService.getFulfillmentOrder(connection, {
          fulfillmentOrderId: fulfillmentOrderId
        })
      )

      if (fulfillmentOrderDetails.status === EShopifyFulfillmentOrderStatus.CLOSED) {
        this.logger.log(
          `The fulfillment order with id: ${fulfillmentOrderId} has already been cancelled in the Shopify.`
        )
        return fulfillmentOrderDetails
      }

      if (
        fulfillmentOrderDetails.supportedActions.find(
          (supportedAction) =>
            supportedAction.action === EShopifyFulfillmentSupportedActions.REQUEST_CANCELLATION
        )
      ) {
        this.logger.log(
          `Sending cancellation request first, for fulfillment order with id: ${fulfillmentOrderId}`
        )
        fulfillmentOrderDetails = await lastValueFrom(
          this.graphQLShopifyService.sendCancellationRequestToFulfillmentService(connection, {
            fulfillmentOrderId
          })
        )
      }

      if (
        fulfillmentOrderDetails.supportedActions.find(
          (supportedAction) =>
            supportedAction.action === EShopifyFulfillmentSupportedActions.CANCEL_FULFILLMENT_ORDER
        )
      ) {
        fulfillmentOrderDetails = await lastValueFrom(
          this.graphQLShopifyService.cancelFulfillmentOrder(connection, { fulfillmentOrderId })
        )
      }

      await lastValueFrom(
        this.graphQLShopifyService.cancelOrder(connection, {
          orderId: fulfillmentOrderDetails.orderId,
          isRefund: false,
          isRestock: false,
          reason: ShopifyOrderCancelReason.OTHER,
          notifyCustomer: true
        })
      )

      this.logger.log(
        `Successfully cancelled fulfillment order for fulfillmentId ${fulfillmentOrderId}`
      )
      this.logger.log(
        `Successfully cancelled  order for customerOrderId: ${fulfillmentOrderDetails.orderId}`
      )

      return fulfillmentOrderDetails
    } catch (err) {
      this.logger.error(err, err?.stack)
      return Promise.resolve(null)
    }
  }


  private hasFullyDiscountedOrderItem(originalOrder: Order): boolean {
    try {
      for (const orderItem of originalOrder.orderItems || []) {
        const isFullyDiscounted = orderItem.pricePaid === orderItem?.discount
        if (isFullyDiscounted) {
          return true
        }
      }
      return false
    } catch (err) {
      throw err
    }
  }

  async sendCancelledOrdersToShop(
    connection: ConnectionAuth,
    cancelledOrderDetails: CancelledOrderDetails[],
    refundOrders: CalculateRefundOrderDto[],
    failedOrdersData: UpdateCancelledOrdersData
  ): Promise<any> {
    try {
      if (!cancelledOrderDetails || !cancelledOrderDetails?.length) return Promise.resolve()

      let customerOrderIdToRefundOrderMapping: Record<number, CalculateRefundOrderDto> =
        this.getCustomerOrderIdToRefundOrderMapping(refundOrders)

      let cancelledNotManualOrderList: ShopifyFulfillmentOrderDetailsGraphQLDto[] = []
      let cancelledManualOrderIdList: number[] = []
      let ordersToProcessFurther: Array<{
        cancelledOrderDetail: CancelledOrderDetails
        order: Order
        refundOrder: CalculateRefundOrderDto
      }> = []

      for (let i = 0; i < cancelledOrderDetails.length; i++) {
        const cancelledOrderDetail: CancelledOrderDetails = cancelledOrderDetails[i]
        const customerOrderIdWithoutSuffix = this.getCustomerIdWithoutSuffix(
          cancelledOrderDetail.customerOrderId
        )

        let refundOrderDetails = customerOrderIdToRefundOrderMapping[customerOrderIdWithoutSuffix]
        let user: JwtUser = {
          id: 0,
          email: 'system@demo.com',
          role: Role.ShopUser,
          implementationId: cancelledOrderDetail.implementationId,
          implementationIds: `${cancelledOrderDetail.implementationId}`,
          entityRole: Role.ShopUser,
          entityId: connection.targetTypeId
        }

        const order: Order = await lastValueFrom(
          this.ordersService.getOrder(cancelledOrderDetail.orderId, user)
        )
        if (!order) {
          this.logger.error(`No order with orderId: ${order.id} exists.`)
          continue
        }

        if (cancelledOrderDetail.isManualOrder) {
          cancelledManualOrderIdList.push(cancelledOrderDetail.orderId)
          ordersToProcessFurther.push({
            order: order,
            refundOrder: refundOrderDetails,
            cancelledOrderDetail: cancelledOrderDetail
          })
          continue
        }

        const cancelledOrderInfo = await this.handleCancellation(
          connection,
          cancelledOrderDetail.shopifyFulfillmentOrderGId as any
        )
        if (!cancelledOrderInfo) {
          failedOrdersData.orderDetails.push(cancelledOrderDetail)
          if (refundOrderDetails) {
            failedOrdersData.refundOrders.push(refundOrderDetails as any)
          }
        }

        if (cancelledOrderInfo) {
          cancelledNotManualOrderList.push(cancelledOrderInfo)
          ordersToProcessFurther.push({
            order: order,
            refundOrder: refundOrderDetails,
            cancelledOrderDetail: cancelledOrderDetail
          })
        }
      }

      if (cancelledManualOrderIdList.length > 0) {
        this.logger.log(
          `Manual order cancelled successfully for orderIds ${cancelledManualOrderIdList?.toString()}`
        )
      }

      this.logger.log({
        message: 'cancelled orders',
        data: cancelledNotManualOrderList?.toString()
      })

      await this.handleFullyDiscountedOrderItemAndRefund(connection, ordersToProcessFurther)
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  async handleFullyDiscountedOrderItemAndRefund(
    connection: ConnectionAuth,
    ordersToProcessFurther: Array<{
      cancelledOrderDetail: CancelledOrderDetails
      order: Order
      refundOrder: CalculateRefundOrderDto
    }>
  ): Promise<any> {
    try {
      if (!ordersToProcessFurther || !ordersToProcessFurther?.length) return Promise.resolve()

      for (const orderDetails of ordersToProcessFurther) {
        const order: Order = orderDetails.order

        const hasFullyDiscountedOrderItem = await this.hasFullyDiscountedOrderItem(order)
        if (hasFullyDiscountedOrderItem) {
          this.logger.log(
            `Order #${order.customerOrderNumber} has fully discounted items - notification skipped for demo purposes`
          )
        }
      }

      return Promise.resolve()
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  private async handleCancellation(
    connection: ConnectionAuth,
    fulfillmentOrderId: ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
  ): Promise<ShopifyFulfillmentOrderDetailsGraphQLDto | null> {
    try {
      if (!fulfillmentOrderId) return Promise.resolve(null)

      return await this.cancelFulfillmentAndOrder(connection, fulfillmentOrderId)
    } catch (err) {
      throw err
    }
  }

  private getCustomerOrderIdToRefundOrderMapping(refundOrders: CalculateRefundOrderDto[]) {
    try {
      let orderIdToRefundOrderMapping: Record<number, CalculateRefundOrderDto> = {}

      for (const refundOrder of refundOrders || []) {
        if (refundOrder?.customerOrderId) {
          const customerOrderIdWithoutSuffix = this.getCustomerIdWithoutSuffix(
            refundOrder.customerOrderId
          )
          orderIdToRefundOrderMapping[customerOrderIdWithoutSuffix] = refundOrder
        }
      }
      return orderIdToRefundOrderMapping
    } catch (err) {
      throw err
    }
  }

  async sendOpenedOrdersToShop(orders: any): Promise<any> {
    return Promise.resolve()
  }

  async sendReturnShipmentsToShop(returns: any): Promise<any> {
    return Promise.resolve()
  }

  private async hasNextPageGraphQl(pageInfo: PageInfoDto, message: CreateEventTriggerDto) {
    try {
      const hasNextPage = pageInfo?.hasNextPage

      if (hasNextPage) {
        if (!message.data) message.data = {}
        this.logger.log(
          `[hasNextPageGraphQl] triggering event for implementationId: ${message.implementationId}, entity: ${message.entity}, action: ${message.action},  nextPageInfo: ${JSON.stringify(pageInfo)}`
        )
        message.data['nextPage'] = pageInfo
        this.triggerService.createEventTrigger(message)
      }
    } catch (e) {
      this.logger.error(e)
    }
  }

  private filterOrdersAndShippingLines(
    connection: ConnectionAuth,
    { orders }: { orders: OrderMapGraphQL }
  ) {
    try {
      const fulfillmentServiceId = connection?.metaInfo?.fulfillmentServiceId
      orders.forEach((orderMap, index) => {
        let shippingLines: ShopifyShippingLineGraphQLDto[] = []
        shippingLines = orderMap.order.shippingLines?.nodes[0]
          ? [orderMap.order.shippingLines.nodes[0]]
          : []

        orderMap.order.shippingLines.nodes = shippingLines
      })
      if (!fulfillmentServiceId) {
        this.logger.warn({
          message: "No Fulfillment Service Id found in connection auth's meta info."
        })
      }
    } catch (err) {
      throw err
    }
  }

  private async getFulfillmentOrders(
    message: RoutedMessage
  ): Promise<ShopifyFulfillmentOrderGraphQLDto[]> {
    try {
      const implementation = await this.getImplementation(message)
      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)

      const locationId = implementation.metaInfo.shopify_location_gid

      const query: QueryShopifyGetOrderDto = {
        assignmentStatus: EShopifyFulfillmentAssignmentStatus.FULFILLMENT_REQUESTED,
        limit: mainConfigs.shopOrdersPageLimit,
        locationId
      }

      let pageInfoResponse: PageInfoDto = { hasNextPage: false, endCursor: null }
      if (message.data?.nextPage) {
        this.logger.log(
          `[getFulfillmentOrders] Have a nextPage implementationId: ${connection.implementationId}`
        )
        pageInfoResponse = message.data.nextPage
      }

      const { pageInfo, fulfillmentOrders } = await lastValueFrom(
        this.graphQLShopifyService.getAssignedFulfillmentOrdersList(connection, {
          nextPage: pageInfoResponse,
          query
        })
      )
      this.logger.log(
        `[getFulfillmentOrders] Fetched fulfillment Orders: ${fulfillmentOrders.length}, implementationId: ${connection.implementationId}`
      )
      this.hasNextPageGraphQl(pageInfo, message)

      return fulfillmentOrders
    } catch (err) {
      throw err
    }
  }

  private getCustomerIdWithoutSuffix(customerOrderId) {
    return customerOrderId?.split('-')[0]
  }

  async getShopifyOrdersByCustomerOrderIds(
    // TODO refactor method for according to new GraphQL migration
    message: RoutedMessage,
    fulfillmentOrders: ShopifyFulfillmentOrderGraphQLDto[]
  ): Promise<{
    orders: OrderMapGraphQL
    existingCustomerOrderIds: {
      customerOrderId: string
      metaInfo: MetaInfoOrder
      id: number
    }[]
  }> {
    const result = {
      orders: new Map<string, OrderMapValuesGraphQL>(),
      existingCustomerOrderIds: null
    }

    try {
      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)

      let customerOrderIdsMap: OrderMapGraphQL =
        this.assignFulfillmentsToOrderMap(fulfillmentOrders) // TODO need to combine fulfillment if order was splitted in multiple fulfillment

      if (customerOrderIdsMap.size === 0) {
        return Promise.resolve(result)
      }

      const { existingCustomerOrderIds, user } = await this.getExistingOrdersFromDemoShopify(
        message,
        customerOrderIdsMap,
        connection
      )

      this.removeExistingFulfillmentsFromMap(existingCustomerOrderIds, customerOrderIdsMap, user)
      // TODO merge below function in single
      const { paidOrPartiallyRefundedOrders, notPaidOrNotPartiallyRefundedOrders } =
        this.filterShopifyFulfillmentOrderByFinancialStatus(customerOrderIdsMap)

      this.assignShopifyOrderToOrderMap(customerOrderIdsMap, paidOrPartiallyRefundedOrders) // assigning order to existing customerOrderIdsMap

      this.eventEmitter.emit('shopify.reject_fulfillment_request', {
        notPaidOrNotPartiallyRefundedOrders,
        fulfillmentOrders,
        configObj: connection
      })

      return { orders: customerOrderIdsMap, existingCustomerOrderIds }
    } catch (err) {
      throw err
    }
  }

  private filterShopifyFulfillmentOrderByFinancialStatus(customerOrderIdsMap: OrderMapGraphQL): {
    paidOrPartiallyRefundedOrders: ShopifyOrderGraphQLDto[]
    notPaidOrNotPartiallyRefundedOrders: ShopifyOrderGraphQLDto[]
  } {
    try {
      let paidOrPartiallyRefundedOrders: ShopifyOrderGraphQLDto[] = []
      let notPaidOrNotPartiallyRefundedOrders: ShopifyOrderGraphQLDto[] = []

      customerOrderIdsMap.forEach((fulfillmentOrder) => {
        const order = fulfillmentOrder.order
        if (
          order.displayFinancialStatus === EShopifyOrderDisplayFinancialStatus.PAID ||
          order.displayFinancialStatus === EShopifyOrderDisplayFinancialStatus.PARTIALLY_REFUNDED
        ) {
          paidOrPartiallyRefundedOrders.push(order)
          return
        }
        notPaidOrNotPartiallyRefundedOrders.push(order)
      })

      return { paidOrPartiallyRefundedOrders, notPaidOrNotPartiallyRefundedOrders }
    } catch (err) {
      throw err
    }
  }

  private assignFulfillmentsToOrderMap(fulfillmentOrders: ShopifyFulfillmentOrderGraphQLDto[]) {
    let customerOrderIdsMap: OrderMapGraphQL = new Map()

    fulfillmentOrders.forEach((fulfillmentOrder) => {
      const customerOrderId = fulfillmentOrder.legacyResourceIdOrderId
      if (!customerOrderIdsMap.has(customerOrderId)) {
        customerOrderIdsMap.set(customerOrderId, {})
      }
      const { order, ...fulfillment } = fulfillmentOrder
      const existingFulfillments = customerOrderIdsMap.get(customerOrderId)?.fulfillments || []
      customerOrderIdsMap.set(customerOrderId, {
        fulfillments: [...existingFulfillments, fulfillment],
        order: order
      })
    })

    return customerOrderIdsMap
  }

  removeExistingFulfillmentsFromMap(
    existingCustomerOrderIds: Array<{
      customerOrderId: string
      metaInfo: MetaInfoOrder
      id: number
    }>,
    customerOrderIdsMap: OrderMapGraphQL,
    user: JwtUser
  ) {
    if (existingCustomerOrderIds.length > 0) {
      for (const { customerOrderId, metaInfo } of existingCustomerOrderIds) {
        const customerIdWithoutSuffix = this.getCustomerIdWithoutSuffix(customerOrderId)

        if (!customerOrderIdsMap.has(customerIdWithoutSuffix)) {
          continue
        }

        const shopifyOrder = customerOrderIdsMap.get(customerIdWithoutSuffix)
        const fulfillmentExists =
          metaInfo.fulfillment_order_id &&
          shopifyOrder.fulfillments.length &&
          shopifyOrder.fulfillments.some(
            ({ legacyResourceId }) => legacyResourceId === metaInfo.fulfillment_order_id
          )

        if (fulfillmentExists) {
          this.logger.log(
            `fulfillment order id: ${metaInfo.fulfillment_order_id} already exists for customer order id: ${customerIdWithoutSuffix} of implementationId: ${user.implementationIds}`
          )

          // removing existing fulfillment from customerOrderIdsMap
          const filteredFulfillmentMap = customerOrderIdsMap
            .get(customerIdWithoutSuffix)
            .fulfillments.filter(
              (fulfillmentId) => fulfillmentId.legacyResourceId != metaInfo.fulfillment_order_id
            )

          if (!filteredFulfillmentMap.length) {
            // if there are no new fulfillment then removing that entry from customerOrderIdsMap
            customerOrderIdsMap.delete(customerIdWithoutSuffix)
            continue
          }

          customerOrderIdsMap.set(customerIdWithoutSuffix, {
            ...customerOrderIdsMap.get(customerIdWithoutSuffix),
            fulfillments: filteredFulfillmentMap
          })
        }
      }
    }
  }

  private assignShopifyOrderToOrderMap(
    customerOrderIdsMap: OrderMapGraphQL,
    orderShopify: ShopifyOrderGraphQLDto[]
  ) {
    customerOrderIdsMap.forEach((fulfillmentOrder, key) => {
      const orderFromShopify = orderShopify.find(
        (shopifyOrder) => String(shopifyOrder.legacyResourceId) === key
      )
      if (!orderFromShopify) customerOrderIdsMap.delete(key)
      orderFromShopify &&
        customerOrderIdsMap.set(key, { ...fulfillmentOrder, order: orderFromShopify })
    })
  }

  private getFulfillmentCountByExistingCustomerIds(
    existingCustomerOrderIds: {
      customerOrderId: string
      metaInfo: MetaInfoOrder
      id: number
    }[]
  ): Record<string, number> {
    return existingCustomerOrderIds.reduce((accu, { customerOrderId }) => {
      const customerIdWithoutSuffix = this.getCustomerIdWithoutSuffix(customerOrderId)

      if (!accu[customerIdWithoutSuffix]) accu[customerIdWithoutSuffix] = 0

      accu[customerIdWithoutSuffix]++
      return accu
    }, {})
  }

  private async getExistingOrdersFromDemoShopify(
    message: RoutedMessage<any>,
    customerOrderIdsMap: OrderMapGraphQL,
    connection: ConnectionAuth
  ) {
    const user: JwtUser = this.getUser(message)

    const customerOrderNumbers: string[] = []
    customerOrderIdsMap.forEach((shopifyOrder) => {
      customerOrderNumbers.push(
        shopifyOrder.order.name
          .replace(connection.metaInfo?.shopifyOrderNumberFormat?.orderNumberFormatPrefix || '', '')
          .replace(
            connection?.metaInfo?.shopifyOrderNumberFormat?.orderNumberFormatSuffix || '',
            ''
          )
      )
    })

    const existingCustomerOrderIds = await lastValueFrom(
      this.ordersService.filterExistingIds({ customerOrderNumbers: customerOrderNumbers }, user)
    )
    return { existingCustomerOrderIds, user }
  }

  async getOrders(message: RoutedMessage): Promise<CreateOrderDto[]> {
    try {
      const user: JwtUser = this.getUser(message)
      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)

      let fulfillmentOrders = await this.getFulfillmentOrders(message)

      const { submittedFulfillmentOrders } = this.filterSubmittedFulfillments(fulfillmentOrders)
      if (!submittedFulfillmentOrders.length) {
        this.logger.log('no submitted orders found in the shopify response')
        return Promise.resolve([])
      }

      let orderResponse = await this.getShopifyOrdersByCustomerOrderIds(
        message,
        submittedFulfillmentOrders
      )

      if (orderResponse?.orders?.size === 0) {
        this.logger.log('no orders to sync')
        return Promise.resolve([])
      }
      const fulfillmentCountByExistingCustomerIds = this.getFulfillmentCountByExistingCustomerIds(
        orderResponse.existingCustomerOrderIds
      )

      // Always picking first shipping line
      this.filterOrdersAndShippingLines(connection, orderResponse)

      const partialCompletedFulfillmentIds = await this.calculateOrdersComplete(user, orderResponse)

      this.logger.log(`order fetched: ${orderResponse.orders.size}`)

      const orderDtoList = this.getMappedDtoFromShopifyGraphQLDto({
        mapType: EntityEnum.order,
        params: {
          shopDtoList: orderResponse,
          extraParams: {
            implementationId: message.implementationId,
            connection,
            partialCompletedFulfillmentIds,
            fulfillmentCountByExistingCustomerIds: fulfillmentCountByExistingCustomerIds
          }
        }
      })

      return orderDtoList
    } catch (error) {
      throw error
    }
  }
  private filterSubmittedFulfillments(fulfillmentOrders: ShopifyFulfillmentOrderGraphQLDto[]) {
    const ffOrdersLength = fulfillmentOrders.length
    const submittedFulfillmentOrders: ShopifyFulfillmentOrderGraphQLDto[] = []
    fulfillmentOrders.forEach((fulfillmentOrder) => {
      if (fulfillmentOrder.requestStatus === EShopifyRequestStatus.SUBMITTED) {
        fulfillmentOrder.legacyResourceId = GraphQlIdConverter.convertFromGraphqlId(
          fulfillmentOrder.id
        )
        fulfillmentOrder.legacyResourceIdOrderId = fulfillmentOrder.order.legacyResourceId
        submittedFulfillmentOrders.push(fulfillmentOrder)
      } else {
        this.logger.warn(
          `Fulfillment order with id ${fulfillmentOrder.id} is not submitted, request_status: ${fulfillmentOrder.requestStatus}`
        )
      }
    })

    submittedFulfillmentOrders.length &&
      this.logger.log(
        `processing total: ${submittedFulfillmentOrders.length} submitted fulfillment orders out of ${ffOrdersLength} fulfillment orders`
      )
    return { submittedFulfillmentOrders }
  }

  async calculateOrdersComplete(
    user: JwtUser,
    {
      orders,
      existingCustomerOrderIds
    }: {
      orders: OrderMapGraphQL
      existingCustomerOrderIds: {
        customerOrderId: string
        metaInfo: MetaInfoOrder
        id: number
      }[]
    }
  ): Promise<PartialCompletedGraphQLDto> {
    const partialCompletedFulfillmentIds: PartialCompletedGraphQLDto = {
      partialFulfilmentsOrderIds: [],
      completedFulfilmentsOrderIds: [],
      fulfillmentOrderQuantityMapping: new Map()
    }

    let existingFulfillmentOrdersIds: Array<number> = []
    let partialFulfillmentsOrderIdsQuantity: Map<string, number> = new Map()
    let originalOrderQuantityMap: Map<string, number> = new Map()
    const demoShopifyOrderItemsQuantityMapping: Map<string, number> = new Map()

    // adding values in originalOrderQuantityMap, partialFulfillmentsOrderIdsQuantity and partialCompletedFulfillmentIds by comparing order line_item quantity with fulfillment quantity
    this.getPartialFulfillmentAndQuantities(
      orders,
      originalOrderQuantityMap,
      partialFulfillmentsOrderIdsQuantity,
      partialCompletedFulfillmentIds
    )
    if (!partialFulfillmentsOrderIdsQuantity.size) return

    // adding values in existingFulfillmentOrdersIds by comparing existingCustomerOrderIds order_id with originalOrderQuantityMap order_id
    this.getExistingOrderIds(
      existingCustomerOrderIds,
      originalOrderQuantityMap,
      existingFulfillmentOrdersIds
    )

    let orderDemoShopify = await this.getExistingDemoShopifyOrders(existingFulfillmentOrdersIds, user)

    this.getDemoShopifyQuantities(orderDemoShopify, demoShopifyOrderItemsQuantityMapping) // adding demo shopify order items quantity in demoShopifyOrderItemsQuantityMapping

    // adding fulfillment ids those are completed partialCompletedFulfillmentIds.completedFulfilmentsOrderIds
    this.compareOriginalOrderAndFulfillments(
      orders,
      demoShopifyOrderItemsQuantityMapping,
      partialFulfillmentsOrderIdsQuantity,
      originalOrderQuantityMap,
      partialCompletedFulfillmentIds
    )

    return partialCompletedFulfillmentIds
  }

  private getExistingOrderIds(
    existingCustomerOrderIds: {
      customerOrderId: string
      metaInfo: MetaInfoOrder
      id: number
    }[],
    originalOrderQuantityMap: Map<string, number>,
    existingFulfillmentOrdersIds: number[]
  ) {
    existingCustomerOrderIds.forEach((order) => {
      const customerIdWithoutSufix = this.getCustomerIdWithoutSuffix(order.customerOrderId)
      const existOrderId = originalOrderQuantityMap.has(customerIdWithoutSufix)
      if (existOrderId) {
        existingFulfillmentOrdersIds.push(order.id)
      }
    })
  }

  private async getExistingDemoShopifyOrders(
    existingFulfillmentOrdersIds: number[],
    user: JwtUser
  ): Promise<Order[]> {
    if (!existingFulfillmentOrdersIds.length) return
    const ordersArr: Order[] = []
    const pageInfo = { limit: 100, page: 1 }
    while (true) {
      const paginatedOrders = await lastValueFrom(
        this.ordersService.filterOrders(
          { ids: [...existingFulfillmentOrdersIds], ...pageInfo },
          user
        )
      )

      ordersArr.push(...paginatedOrders.items)
      if (!paginatedOrders.links?.next) {
        break
      }
      pageInfo.page++
    }
    return ordersArr
  }

  // TODO refactor this
  private compareOriginalOrderAndFulfillments(
    orders: OrderMapGraphQL,
    demoShopifyOrderItemsQuantityMapping: Map<string, number>,
    partialFulfillmentsOrderIdsQuantity: Map<string, number>,
    originalOrderQuantityMap: Map<string, number>,
    partialCompletedFulfillmentIds: PartialCompletedGraphQLDto
  ) {
    for (const [customerOrderId, order] of orders) {
      let fulfillmentQuantityCounter = 0
      for (const fulfillment of order.fulfillments) {
        if (!partialFulfillmentsOrderIdsQuantity.get(fulfillment.legacyResourceId)) continue

        const demoShopifyOrderSize = demoShopifyOrderItemsQuantityMapping.get(customerOrderId) || 0
        let fulfillmentOrderQuantity = partialFulfillmentsOrderIdsQuantity.get(
          fulfillment.legacyResourceId
        )
        const originalOrderSize = originalOrderQuantityMap.get(fulfillment.legacyResourceIdOrderId)

        if (
          originalOrderSize ===
          demoShopifyOrderSize + fulfillmentOrderQuantity + fulfillmentQuantityCounter
        ) {
          partialCompletedFulfillmentIds.completedFulfilmentsOrderIds.push(
            fulfillment.legacyResourceId
          )
        }
        fulfillmentQuantityCounter += fulfillmentOrderQuantity
      }
    }
  }

  private getDemoShopifyQuantities(orderDemoShopify: Order[], demoShopifyOrderItemsQuantityMapping: Map<string, number>) {
    orderDemoShopify &&
      orderDemoShopify?.forEach((demoShopifyOrder) => {
        const customerOrderId = this.getCustomerIdWithoutSuffix(demoShopifyOrder?.customerOrderId)
        if (!demoShopifyOrderItemsQuantityMapping.has(customerOrderId)) {
          demoShopifyOrderItemsQuantityMapping.set(customerOrderId, 0)
        }

        const demoShopifyOrderItemsQuantity = demoShopifyOrder?.orderItems?.reduce((accumulator, orderItem) => {
          if (!orderItem?.metaInfo?.fulfillment_order_line_item_id) return accumulator
          return (accumulator += orderItem.quantity)
        }, 0)
        demoShopifyOrderItemsQuantityMapping.set(
          customerOrderId,
          demoShopifyOrderItemsQuantityMapping.get(customerOrderId) + demoShopifyOrderItemsQuantity
        )
      })
  }

  private getPartialFulfillmentAndQuantities(
    orders: OrderMapGraphQL,
    originalOrderQuantityMap: Map<string, number>,
    partialFulfillmentsOrderIdsQuantity: Map<string, number>,
    partialCompletedFulfillmentIds: PartialCompletedGraphQLDto
  ) {
    for (const [_customerOrderId, order] of orders) {
      for (const fulfillment of order.fulfillments) {
        const fulfillmentQuantity = fulfillment.lineItems.nodes.reduce(
          (accumulator, item) => (accumulator += item.totalQuantity),
          0
        )
        const originalOrder = orders.get(fulfillment.legacyResourceIdOrderId)
        let originalOrderQuantity = 0

        if (!originalOrderQuantityMap.has(fulfillment.legacyResourceIdOrderId)) {
          originalOrderQuantity =
            (originalOrder &&
              originalOrder?.order?.lineItems.nodes.reduce(
                (accumulator, item) => (accumulator += item.quantity),
                0
              )) ||
            0
          originalOrderQuantityMap.set(fulfillment.legacyResourceIdOrderId, originalOrderQuantity)
        }

        if (fulfillmentQuantity != originalOrderQuantity) {
          partialFulfillmentsOrderIdsQuantity.set(fulfillment.legacyResourceId, fulfillmentQuantity)
          partialCompletedFulfillmentIds.partialFulfilmentsOrderIds.push(
            fulfillment.legacyResourceId
          )
        }
      }
    }
  }

  async getInventoryItems(message: RoutedMessage): Promise<any> {
    try {
      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)
      let updatedAtMin
      if (message.data?.nextPage) {
        updatedAtMin = message.data.nextPage.updatedAtMin
      } else {
        const lastSyncedAt = await this.getLastSync(connection, EntityEnum.inventoryItem)
        updatedAtMin =
          lastSyncedAt && new Date(lastSyncedAt?.getTime() - 1000 * 3600)?.toISOString() // reduce time by 1 hour so we don't miss any product to fetch
      }
      const query: QueryProductDto = {
        updated_at_min: updatedAtMin,
        product_status: 'active',
        limit: mainConfigs.shopProductsPageLimit
      }

      const { pageInfo, productVariants } = await lastValueFrom(
        this.graphQLShopifyService.getProductList(connection, {
          nextPage: message.data?.nextPage,
          query
        })
      )

      if (productVariants.length === 0) {
        this.logger.log('no inventory items to sync')
        return Promise.resolve({})
      }

      const shopifyInventoryItemIds: string[] = []

      for (const productVariant of productVariants) {
        if (productVariant.inventoryItem.legacyResourceId)
          shopifyInventoryItemIds.push(productVariant.inventoryItem.legacyResourceId)
      }
      let response: ShopifyInventoryItemGraphQLDto[] = []
      let pageInfoResponse: PageInfoDto = { hasNextPage: false, endCursor: null }

      while (true) {
        const data = await lastValueFrom(
          this.graphQLShopifyService.getInventoryFilter(connection, {
            query: { ids: shopifyInventoryItemIds, limit: mainConfigs.shopProductsPageLimit },
            nextPage: pageInfoResponse
          })
        )
        pageInfoResponse = data.pageInfo
        response.push(...data.inventoryItems)
        if (!pageInfoResponse?.hasNextPage) {
          break
        }
      }

      const inventoryItemObj = {}
      for (let i = 0; i < response.length; i++) {
        inventoryItemObj[response[i].legacyResourceId] = {
          country_code_of_origin: response[i].countryCodeOfOrigin,
          harmonized_system_code: response[i].harmonizedSystemCode
        }
      }

      for (const productVariant of productVariants) {
        productVariant[`inventory_item_obj`] = inventoryItemObj[
          productVariant.inventoryItem.legacyResourceId
        ]
          ? inventoryItemObj[productVariant.inventoryItem.legacyResourceId]
          : {}
      }

      this.logger.log({
        message: 'inventory items',
        data: { productVariants: productVariants.length }
      })

      const inventoryItemList: CreateInventoryItemDto[] = this.getMappedDtoFromShopifyGraphQLDto({
        mapType: EntityEnum.inventoryItem,
        params: {
          productVariants: productVariants,
          extraParams: { implementationId: message.implementationId }
        }
      })

      const user: JwtUser = this.getUser(message)
      const implementation = await lastValueFrom(
        this.implementationsService.getImplementation(message.implementationId, user)
      )

      const partnerLocationInventoryItemList: CreatePartnerLocationInventoryItemDto[] =
        this.getMappedDtoFromShopifyGraphQLDto({
          mapType: EntityEnum.partnerLocationInventoryItem,
          params: {
            productVariants: productVariants,
            extraParams: {
              implementationId: message.implementationId,
              partnerLocationId: implementation.partnerLocationId
            }
          }
        })
      this.hasNextPageGraphQl({ ...pageInfo, updatedAtMin }, message)

      if (inventoryItemList.length === 0) {
        throw new Error('inventoryItemList is empty')
      }

      await new Promise((resolve) => setTimeout(resolve, 1200))

      return {
        inventoryItems: inventoryItemList,
        plInventoryItems: partnerLocationInventoryItemList
      }
    } catch (error) {
      throw error
    }
  }

  async updateInventoryLevels(message: RoutedMessage): Promise<any> {
    try {
      const data: {
        inventoryItem: InventoryItem
        inventoryLevel: InventoryLevelType[]
        manualNotConfirmedOrdersQty: number
        eventType: EventType
      } = message.data.inventoryLevelSource

      const inventoryItem = data?.inventoryItem

      if (!inventoryItem) {
        this.logger.log('Inventory item is empty to update inventory level')
        return Promise.resolve()
      }

      if (
        !inventoryItem?.metaInfo?.shopify_inventory_item_id ||
        !inventoryItem?.metaInfo?.shopify_inventory_item_gid
      ) {
        this.logger.error(
          `shopify_inventory_item_id or shopify_inventory_item_gid of inventoryItemId: ${inventoryItem.id},customerItemId: ${inventoryItem.customerItemId} and sku: ${inventoryItem.sku} is empty to update inventory level`
        )
        return Promise.resolve()
      }

      return await this.sendUpdatedInventoryLevelsToShop(
        inventoryItem,
        data?.inventoryLevel,
        data.manualNotConfirmedOrdersQty,
        data?.eventType
      )
    } catch (error) {
      this.logger.log(error, error?.stack)
      throw error
    }
  }

  async updateCancelledOrders(
    message: RoutedMessage<UpdateCancelledOrdersData | UpdateCancelledOrdersDataRetryData>
  ): Promise<void> {
    try {
      const data = message.data as UpdateCancelledOrdersData
      if (!message.data || !data.orderDetails) {
        throw Error(`fulfillmentOrderIds info missing.`)
      }

      const orderDetails: CancelledOrderDetails[] = data.orderDetails
      const refundOrders = data.refundOrders

      let failedOrdersData: UpdateCancelledOrdersData = { orderDetails: [], refundOrders: [] }

      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)
      const result = await this.sendCancelledOrdersToShop(
        connection,
        orderDetails,
        refundOrders as any,
        failedOrdersData
      )

      if (failedOrdersData.orderDetails.length || failedOrdersData.refundOrders.length) {
        const retryInfo: any = JSON.parse(JSON.stringify(message.data))
        retryInfo.orderDetails = failedOrdersData.orderDetails
        retryInfo.refundOrders = failedOrdersData.refundOrders

        message.data = retryInfo as any
      }

      return result
    } catch (error) {
      throw error
    }
  }

  async getLastSync(connection: ConnectionAuth, entity: string): Promise<Date | null> {
    const targetSync = await this.targetSyncRepository.findOne({
      where: { entityType: entity, connectionAuthId: connection.id },
      order: { syncedAt: 'DESC' }
    })

    if (!targetSync) {
      return null
    }

    return targetSync.syncedAt
  }

  getVariantImages(product: ShopifyProductDto, variantImageId: number): ShopifyProductImageDto[] {
    let images: ShopifyProductImageDto[] = []
    const defaultImage = product.image
    const variantImage = product.images?.find(
      (image: ShopifyProductImageDto) => image.id === variantImageId
    )

    if (variantImage) {
      images = [variantImage]
    } else if (defaultImage) {
      images = [defaultImage]
    }

    return images
  }

  getMappedDtoFromShopDto(data) {
    switch (data.mapType) {
      case EntityEnum.inventoryItem:
      case EntityEnum.partnerLocationInventoryItem:
        const itemList = []

        for (const productVariant of data.params
          .productVariants as ShopifyProductVariantGraphQlDto[]) {
          const mappedItem = this.mapperService.mapFrom(data.mapType, {
            shopifyProductVariant: productVariant,
            extraParams: {
              ...data.params.extraParams,
              productTitle: productVariant.product.title,
              images: productVariant.image
                ? [productVariant.image]
                : [productVariant.product.featuredMedia?.preview?.image],
              description: productVariant.product.descriptionHtml
            }
          })
          if (mappedItem) itemList.push(mappedItem)
        }

        return itemList
      case EntityEnum.order:
        const orderDtoList = []
        for (const [_customerOrderId, order] of data.params.shopDtoList?.orders) {
          for (const fulfillment of order.fulfillments) {
            const mappedOrder = this.mapperService.mapFrom(EntityEnum.order, {
              fulfillment,
              extraParams: { ...data.params.extraParams, shopifyOrder: order.order },
              order
            })
            if (mappedOrder) orderDtoList.push(mappedOrder)
          }
        }
        return orderDtoList
      case EntityEnum.fieldMapper:
        const shippingMethodsToFieldMapper = []
        for (const shippingMethod of data.params.shippingMethods) {
          const mappedFieldMapper = this.mapperService.mapFrom(EntityEnum.fieldMapper, {
            shippingMethodName: shippingMethod
          })
          if (mappedFieldMapper) shippingMethodsToFieldMapper.push(mappedFieldMapper)
        }
        return shippingMethodsToFieldMapper
      default:
        throw 'incorrect mapType'
    }
  }

  getMappedDtoFromShopifyGraphQLDto(data) {
    switch (data.mapType) {
      case EntityEnum.inventoryItem:
      case EntityEnum.partnerLocationInventoryItem:
        const itemList = []

        for (const productVariant of data.params
          .productVariants as ShopifyProductVariantGraphQlDto[]) {
          const mappedItem = this.graphQLMapperService.mapFrom(data.mapType, {
            shopifyProductVariant: productVariant,
            extraParams: {
              ...data.params.extraParams,
              productTitle: productVariant.product.title,
              images: productVariant.image
                ? [productVariant.image]
                : [productVariant.product.featuredMedia?.preview?.image],
              description: productVariant.product.descriptionHtml
            }
          })
          if (mappedItem) itemList.push(mappedItem)
        }
        return itemList

      case EntityEnum.order:
        const orderDtoList = []
        for (const [_customerOrderId, order] of data.params.shopDtoList?.orders) {
          for (const fulfillment of order.fulfillments) {
            const mappedOrder = this.graphQLMapperService.mapFrom(EntityEnum.order, {
              fulfillment,
              extraParams: { ...data.params.extraParams, shopifyOrder: order.order },
              order
            })
            if (mappedOrder) orderDtoList.push(mappedOrder)
          }
        }
        return orderDtoList

      default:
        throw 'incorrect mapType'
    }
  }

  async createShipments(message: RoutedMessage): Promise<any> {
    try {
      if (message.data.length === 0) {
        this.logger.log('no shipments to create in shop')
        return Promise.resolve()
      }

      let failedShipments: CreateShipmentDto[] = []

      let shopifyShipmentList = []
      for (let i = 0; i < message.data.length; i++) {
        const info = message.data[i]

        const carriers = message.data.map(
          (e: { outboundShipment: OutboundShipment }) => e.outboundShipment.carrier
        )

        const carrierFieldMapperObj = await this.fieldMapperService.getValueFromFieldMapper(
          {
            where: [
              {
                entityType: EntityEnum.outboundShipment,
                entityField: ShopServiceMapperFields.carrier,
                wmsValue: In(carriers),
                implementationId: message.implementationId
              },
              {
                entityType: EntityEnum.outboundShipment,
                entityField: ShopServiceMapperFields.carrier,
                implementationId: message.implementationId,
                isDefault: true
              }
            ]
          },
          OrgType.Shop
        )

        message.data?.forEach((e: { outboundShipment: OutboundShipment }) => {
          e.outboundShipment.carrier =
            carrierFieldMapperObj.fieldMappersObj[
            `${message.implementationId}_${e.outboundShipment.carrier}`
            ] ||
            carrierFieldMapperObj.defaultFieldMapper?.shopValue ||
            e.outboundShipment.carrier
        })

        const user: JwtUser = this.getUser(message)
        const order: Order = await lastValueFrom(
          this.ordersService.getOrder(info.outboundShipment.orderId, user)
        )

        const shopShipmentDto = await this.getShopShipmentDto(
          info.outboundShipment,
          info.locationId,
          info.outboundShipmentItemSkuToQuantityMapping,
          order
        )

        shopifyShipmentList.push({ dto: shopShipmentDto, info })
        await this.updateOrderItemsShippedQuantity(shopShipmentDto, order, user)
        this.logger.log({
          message: 'shopShipmentDto',
          shopShipmentDtoData: JSON.stringify(shopShipmentDto)
        })
      }

      await this.sendShipmentsToShop(shopifyShipmentList, message, failedShipments)
      if (failedShipments.length) {
        message.data = { retryInfo: failedShipments }
      }

      return Promise.resolve()
    } catch (error) {
      throw error
    }
  }

  private async updateOrderItemsShippedQuantity(
    shopShipmentDto: ShopifyShipmentGraphQLDto,
    order: Order,
    user: JwtUser
  ) {
    try {
      if (!shopShipmentDto?.lineItemsByFulfillmentOrder) return
      if (
        !shopShipmentDto?.lineItemsByFulfillmentOrder?.fulfillmentOrderLineItems ||
        shopShipmentDto?.lineItemsByFulfillmentOrder?.fulfillmentOrderLineItems.length === 0
      )
        return

      const fulfillmentOrderLineItemIdToQuantityMapping: Record<
        ShopifyGraphQLId<ShopifyResources.FulfillmentOrderLineItem>,
        number
      > = {}

      for (const fulfillment_order_line_item of shopShipmentDto.lineItemsByFulfillmentOrder
        .fulfillmentOrderLineItems) {
        fulfillmentOrderLineItemIdToQuantityMapping[fulfillment_order_line_item.id] =
          fulfillment_order_line_item.quantity
      }

      for (const orderItem of order.orderItems) {
        if (!orderItem.metaInfo?.shopify_fulfillment_order_line_item_gid) continue
        const quantityShipped: number =
          fulfillmentOrderLineItemIdToQuantityMapping[
          orderItem.metaInfo?.shopify_fulfillment_order_line_item_gid
          ]

        if (!quantityShipped) continue

        const prevShippedQuantity: number = orderItem.metaInfo?.shipped_quantity || 0
        const currShippedQuantity: number = prevShippedQuantity + quantityShipped
        let metaInfo: MetaInfoOrderItem = orderItem.metaInfo
        metaInfo.shipped_quantity = currShippedQuantity
        await lastValueFrom(
          this.ordersService.updateOrderItem(orderItem.id, { metaInfo: metaInfo as any }, user)
        )
      }
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  private async getShopShipmentDto(
    shipment: OutboundShipment,
    locationId: string,
    outboundShipmentItemSkuToQuantityMapping: Record<string, number>,
    order: Order
  ): Promise<ShopifyShipmentGraphQLDto> {
    return this.graphQLMapperService.mapTo(EntityEnum.outboundShipment, {
      shipment,
      extraParams: { location_id: locationId, outboundShipmentItemSkuToQuantityMapping, order }
    })
  }

  async updateOpenedOrders(
    message?: RoutedMessage<UpdateOpenOrdersData | UpdateOpenOrdersDataRetryData>
  ): Promise<any> {
    const connection = await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)

    try {
      const data = message.data as UpdateOpenOrdersData
      const fulFillmentOrderGIds = data.fulfillmentOrderGIds
      let failedFulFillmentOrderIds = []

      if (
        !fulFillmentOrderGIds ||
        (Array.isArray(fulFillmentOrderGIds) && !fulFillmentOrderGIds.length)
      ) {
        this.logger.log('updateOpenedOrders: fulFillmentOrderGIds is empty!')
        return Promise.resolve()
      }

      this.logger.log(`processing order fulfillment of ids: ${fulFillmentOrderGIds.toString()}`)

      const updateOpenOrderList = []

      for (let fulFillmentOrderGId of fulFillmentOrderGIds) {
        let fulfillmentOrderDetails: ShopifyFulfillmentOrderDetailsGraphQLDto
        try {
          fulfillmentOrderDetails = await lastValueFrom(
            this.graphQLShopifyService.getFulfillmentOrder(connection, {
              fulfillmentOrderId: fulFillmentOrderGId
            })
          )
        } catch (err) {
          failedFulFillmentOrderIds.push(fulFillmentOrderGId)
          this.logger.error(err, err?.stack)
        }

        if (
          !fulfillmentOrderDetails ||
          fulfillmentOrderDetails.status !== EShopifyFulfillmentOrderStatus.OPEN
        ) {
          this.logger.warn(
            `The fulfillmentOrder with id: ${fulFillmentOrderGId} is not in an open state, therefore the fulfillment cannot be accepted.`
          )
          continue
        }

        await lastValueFrom(
          this.graphQLShopifyService.acceptFulfillment(connection, {
            fulfillmentOrderGId: fulFillmentOrderGId
          })
        )
          .then((info) => {
            if (info) {
              updateOpenOrderList.push(info)
            }
          })
          .catch((err) => {
            failedFulFillmentOrderIds.push(fulFillmentOrderGId)
            this.logger.error(err, err?.stack)
          })
      }

      this.logger.log({
        message: 'updated open orders',
        updateOpenOrderListData: JSON.stringify(updateOpenOrderList)
      })
      if (failedFulFillmentOrderIds.length) {
        const retryInfo = JSON.parse(JSON.stringify(message.data))
        retryInfo.fulfillmentOrderIds = failedFulFillmentOrderIds
        message.data = { retryInfo }
      }
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  createReturnShipments(data: any): Promise<any> {
    return Promise.resolve('')
  }

  async calculateRefundOrder(
    refundOrderDto: CalculateRefundOrderDto,
    calculateRefundOrderResponse: CalculateRefundOrderResponseDto
  ): Promise<CalculateRefundOrderResponseDto> {
    try {
      const connection = await this.connectionAuthsService.getConnectionPool<OrgType.Shop>({
        implementationId: refundOrderDto.implementationId,
        target: OrgType.Shop
      })

      let user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        implementationId: connection.implementationId,
        implementationIds: String(connection.implementationId),
        entityRole: Role.ShopUser,
        entityId: connection.targetTypeId
      }

      const order: Order = await lastValueFrom(
        this.ordersService.getOrder(refundOrderDto?.orderId, user)
      )

      if (!order) {
        this.logger.error(`Order not found with orderId :${refundOrderDto?.orderId}`)
        throw new NotFoundException()
      }

      if (order.channel === 'manual') return Promise.resolve(calculateRefundOrderResponse)

      let deletedOrderItemsLineItemIdToSkuMapping: Record<number, string> = {}

      for (const orderItem of refundOrderDto?.orderItems || []) {
        if (orderItem?.customerLineItemId) {
          deletedOrderItemsLineItemIdToSkuMapping[orderItem.customerLineItemId] = orderItem.sku
        }
      }

      const refundDto = this.graphQLMapperService.mapTo(EntityEnum.refundOrder, {
        refundOrderDto,
        extraParams: { orderItems: order.orderItems }
      })
      this.logger.log(`calculating shopify order's refund for query: ${JSON.stringify(refundDto)}`)

      const customerOrderIdWithoutSuffix = this.getCustomerIdWithoutSuffix(order.customerOrderId)

      const shopifyCalculateRefundResponse = await lastValueFrom(
        this.graphQLShopifyService.calculateRefund(connection, {
          refundDto,
          customerOrderId: GraphQlIdConverter.convertToGraphqlId(
            customerOrderIdWithoutSuffix,
            ShopifyResources.Order
          ) as ShopifyGraphQLId<'Order'>
        })
      )

      const refundOrderResponse = this.graphQLMapperService.mapFrom(EntityEnum.refundOrder, {
        shopifyCalculateRefundResponse,
        extraParams: {
          orderItems: order.orderItems,
          implementationId: refundOrderDto.implementationId,
          orderId: refundOrderDto.orderId,
          returnShipmentId: refundOrderDto.returnShipmentId,
          lineItemIdToSkuMapping: deletedOrderItemsLineItemIdToSkuMapping
        }
      })

      return Promise.resolve(refundOrderResponse)
    } catch (error) {
      this.handleShopifyRefundError(error)
    }
  }

  async createRefundOrder(
    refundOrderDto: CalculateRefundOrderResponseDto,
    isRefundRequired: boolean,
    isRestockRequired: boolean = false
  ): Promise<(ShopifyCreateRefundResponseGraphQLDto & { legacyId: string }) | null> {
    try {
      const { shopResponse, refundOrder } = refundOrderDto

      const connection = await this.connectionAuthsService.getConnectionPool<OrgType.Shop>({
        implementationId: refundOrder.implementationId,
        target: OrgType.Shop
      })

      let user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        implementationId: refundOrder.implementationId,
        implementationIds: `${refundOrder.implementationId}`,
        entityRole: Role.ShopUser,
        entityId: connection.targetTypeId
      }

      const order: Order = await lastValueFrom(
        this.ordersService.getOrder(refundOrderDto.refundOrder.orderId, user)
      )

      if (!order) {
        this.logger.error(`Order not found with orderId :${refundOrderDto.refundOrder.orderId}`)
        throw new NotFoundException()
      }

      if (order.channel === 'manual') return Promise.resolve(null)

      if (!order.metaInfo?.fulfillment_order_id) {
        const errorMessage = `fulfillment_order_id is empty for orderId :${order.id}`
        this.logger.error(errorMessage)
        throw new UnprocessableEntityException(errorMessage)
      }

      const implementation = await lastValueFrom(
        this.implementationsService.getImplementation(connection.implementationId, user)
      )

      const shopifyCreateRefundPayload = this.getShopifyCreateRefundPayload(
        shopResponse,
        order,
        implementation,
        isRestockRequired,
        isRefundRequired
      )

      if (refundOrder.refundReason) shopifyCreateRefundPayload.note = refundOrder.refundReason

      const shopifyCreateRefundResponse = await lastValueFrom(
        this.graphQLShopifyService.createRefund(connection, shopifyCreateRefundPayload)
      )
      this.logger.log(
        `Refund is created in shopify for orderId: ${order.id} with shop refund Order Id: ${shopifyCreateRefundResponse.id}`
      )

      const refundId = GraphQlIdConverter.convertFromGraphqlId(shopifyCreateRefundResponse.id)

      return Promise.resolve({ legacyId: refundId, ...shopifyCreateRefundResponse })
    } catch (error) {
      this.handleShopifyRefundError(error)
    }
  }

  async createRefundOrders(message: RoutedMessage<CalculateRefundOrderDto[]>): Promise<any> {
    try {
      const refundOrders: CalculateRefundOrderDto[] = message.data

      if (!refundOrders || !Array.isArray(refundOrders) || !refundOrders.length) {
        this.logger.log('No refundOrders to create refund in the shop')
        return Promise.resolve()
      }

      const createdRefundOrderIds = []

      for (let refundOrder of refundOrders) {
        const calculateRefundOrderResponse: any =
          await this.refundOrdersService.calculateRefundOrder(refundOrder as any)
        const calculatedRefundOrder: any =
          await this.calculateRefundOrder(refundOrder as any, calculateRefundOrderResponse)

        const createdRefundOrder = await this.createRefundOrder(
          calculatedRefundOrder,
          refundOrder.isRefundRequired,
          true
        )

        if (!createdRefundOrder) {
          this.logger.warn(
            `failed to create refund order for orderId: ${refundOrder.orderId} and implementationId: ${refundOrder.implementationId}`
          )
          continue
        }

        calculateRefundOrderResponse.refundOrder.customerRefundId =
          createdRefundOrder.legacyId.toString()
        calculateRefundOrderResponse.refundOrder.metaInfo = {
          shopify_refund_gid: createdRefundOrder.id
        }
        const createdRefundOrderResponse =
          await this.refundOrdersService.createRefundOrderAfterRefundCalculation(
            calculatedRefundOrder as any
          )

        createdRefundOrderIds.push(createdRefundOrderResponse.id)
      }

      this.logger.log(
        `Refund order created successfully for refundOrderIds ${createdRefundOrderIds}`
      )

      return Promise.resolve()
    } catch (error) {
      throw error
    }
  }

  getShopifyCreateRefundPayload(
    shopResponse: ShopifyCalculateRefundResponseGraphQLDto,
    order: Order,
    implementation: Implementation,
    isRestockRequired: boolean,
    isRefundRequired: boolean
  ): ShopifyCreateRefundGraphQLDto {
    const orderId = GraphQlIdConverter.convertToGraphqlId(
      order.customerOrderId,
      ShopifyResources.Order
    ) as ShopifyGraphQLId<'Order'>

    this.logger.log(
      `creating refund for orderId: ${order.id} for orderItems ${shopResponse.refundLineItems.map((item) => `${item.lineItem.id}:${item.quantity}`).join(', ')}`
    )

    const refundLineItems: ShopifyCreateRefundGraphQLDto['refundLineItems'] = []
    shopResponse.refundLineItems.forEach((lineItem) => {
      const locationId = lineItem.location?.id || implementation.metaInfo.shopify_location_gid
      if (!locationId) {
        this.logger.error(`location id not found for orderId ${orderId}`)
        throw new Error(`location id not found for orderId ${orderId}`)
      }

      refundLineItems.push({
        lineItemId: lineItem.lineItem.id,
        locationId: locationId as ShopifyGraphQLId<'Location'>,
        quantity: lineItem.quantity,
        restockType: isRestockRequired ? ShopifyRestockType.RETURN : ShopifyRestockType.NO_RESTOCK
      })
    })

    const createRequestData: ShopifyCreateRefundGraphQLDto = {
      orderId: orderId,
      refundLineItems: refundLineItems,
      transactions: shopResponse.suggestedTransactions.map((transaction) => {
        return {
          orderId: orderId,
          amount: isRefundRequired ? transaction.amountSet.shopMoney.amount : '0.00',
          gateway: transaction.gateway,
          kind: SuggestedOrderTransactionKind.REFUND,
          parentId: transaction.parentTransaction.id
        }
      })
    }
    return createRequestData
  }

  handleShopifyRefundError(error: any) {
    if (error?.response?.status === 422) {
      this.logger.error(error.response?.data?.errors)
      throw new BadRequestException(error.response?.data?.errors)
    }

    throw error
  }

  async getShopDetails(message?: RoutedMessage<any>): Promise<void> {
    try {
      this.logger.log(`fetching shop details for implementationId: ${message.implementationId}`)

      let shopifyPlan: ShopifyPlan = {}
      let shopifyRateLimit: RateLimitConfig = {} as RateLimitConfig

      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)

      const shopDetail = await lastValueFrom(this.graphQLShopifyService.getShopDetails(connection))

      const shopPlanDetail = shopDetail.plan

      // shopifyOrderNumberFormat detail require to extract order_number from name field of order
      const shopifyOrderNumberFormat = {
        orderNumberFormatPrefix: shopDetail.orderNumberFormatPrefix,
        orderNumberFormatSuffix: shopDetail.orderNumberFormatSuffix
      }
      const plan = shopifyPlanRateLimitConfig.find(
        (config) => config.planDisplayName === shopPlanDetail.displayName
      )

      shopifyPlan.planDisplayName = shopPlanDetail.displayName
      shopifyRateLimit.allowedRequest = plan
        ? plan.allowedRequest
        : mainConfigs.rateLimit.default.allowedRequest
      shopifyRateLimit.ttlInSeconds = plan
        ? plan.ttlInSeconds
        : mainConfigs.rateLimit.default.ttlInSeconds
      shopifyPlan.rateLimit = shopifyRateLimit

      const metaInfo: ConnectionAuthMetaInfo = {
        ...connection.metaInfo,
        shopifyPlan,
        shopifyOrderNumberFormat
      }

      await this.connectionAuthsService.update(connection.id, { metaInfo })

      return Promise.resolve()
    } catch (error) {
      throw error
    }
  }

  async createFulfillmentService(
    shopifyCredentialDto: ShopifyCredentialDto | ConnectionAuth,
    user: JwtUser
  ): Promise<ShopifyFulfillmentServiceDto> {
    try {
      const fulfillmentServices = await lastValueFrom(
        this.graphQLShopifyService.getFulfillmentServices(shopifyCredentialDto as ConnectionAuth)
      )

      const fulfillmentServiceDetails: ShopifyFulfillmentServiceDetails = {
        ...CREATE_FULFILLMENT_SERVICE_GRAPHQL_PAYLOAD
      }

      if (
        shopifyCredentialDto instanceof ShopifyCredentialDto &&
        shopifyCredentialDto.tenantLocationName
      ) {
        fulfillmentServiceDetails.name = shopifyCredentialDto.tenantLocationName
      }

      if (fulfillmentServices && fulfillmentServices.length > 0) {
        const demoShopifyFulfillmentService = fulfillmentServices.find(
          (fulfillmentServiceDetail) =>
            fulfillmentServiceDetail?.serviceName === fulfillmentServiceDetails.name
        )

        if (demoShopifyFulfillmentService) {
          return FulfillmentServiceMapper.mapFrom(demoShopifyFulfillmentService)
        }
      }

      const fulfillmentService = await lastValueFrom(
        this.graphQLShopifyService.createFulfillmentService(
          shopifyCredentialDto as ConnectionAuth,
          fulfillmentServiceDetails
        )
      )

      return FulfillmentServiceMapper.mapFrom(fulfillmentService)
    } catch (err) {
      if (err.status === 422) {
        err.message = err?.response?.fulfillment_orders_opt_in?.toString()
      }

      if (err.status === 400) {
        throw new BadRequestException(err?.response?.fulfillment_service)
      }

      throw err
    }
  }

  async getSubscribedWebhooks(
    geSubscribeWebhooksDto: ShopifyGetSubscribedWebhooksDto,
    user: JwtUser
  ) {
    const connection = await this.connectionAuthsService.getConnectionPool<OrgType.Shop>({
      implementationId: geSubscribeWebhooksDto.implementationId,
      target: OrgType.Shop
    })

    if (!connection) throw new NotFoundException('Connection Auth not found')

    const subscribeWebhookRes = await lastValueFrom(
      this.graphQLShopifyService.getSubscribedWebhooks(connection, {
        limit: geSubscribeWebhooksDto.limit,
        endCursor: geSubscribeWebhooksDto.endCursor
      })
    )

    return subscribeWebhookRes
  }

  async subscribeWebhook(subscribeWebhookDto: ShopifySubscribeWebhookDto, user: JwtUser) {
    const connection = await this.connectionAuthsService.getConnectionPool<OrgType.Shop>({
      implementationId: subscribeWebhookDto.implementationId,
      target: OrgType.Shop
    })

    if (!connection) throw new NotFoundException('Connection Auth not found')

    const subscribeWebhookRes = await lastValueFrom(
      this.graphQLShopifyService.subscribeWebhook(connection, {
        topic: subscribeWebhookDto.topic,
        callbackUrl: `${subscribeWebhookDto.callbackUrl}/shop/shopify/webhooks?implementationId=${subscribeWebhookDto.implementationId}`
      })
    )

    return subscribeWebhookRes
  }

  handleShopifyWebhook(data: {
    implementationId: number
    topic: string
    shopDomain: string
    data: Record<string, any>
  }) {
    this.shopifyWebhookLogger.info(data)
  }

  async unSubscribeWebhook(unSubscribeWebhookDto: ShopifyUnSubscribeWebhookDto, user: JwtUser) {
    const connection = await this.connectionAuthsService.getConnectionPool<OrgType.Shop>({
      implementationId: unSubscribeWebhookDto.implementationId,
      target: OrgType.Shop
    })

    if (!connection) throw new NotFoundException('Connection Auth not found')

    const unSubscribeWebhookRes = await lastValueFrom(
      this.graphQLShopifyService.unSubscribeWebhook(connection, {
        id: unSubscribeWebhookDto.webhookId
      })
    )

    return unSubscribeWebhookRes
  }

  async getShippingMethod(queryFieldMapper: QueryFieldMapper): Promise<FieldMapper[]> {
    try {
      const { implementationId } = queryFieldMapper
      const connection = await this.connectionAuthsService.getConnectionPool<OrgType.Shop>({
        implementationId: implementationId,
        target: OrgType.Shop
      })

      const deliveryProfiles = await lastValueFrom(
        this.graphQLShopifyService.getShippingMethods(connection)
      )

      let shippingMethodNameSet: Set<string> = new Set()
      for (let deliveryProfile of deliveryProfiles) {
        for (let profileLocationGroup of deliveryProfile.profileLocationGroups) {
          for (let locationGroupZone of profileLocationGroup.locationGroupZones.nodes) {
            for (let methodDefinition of locationGroupZone.methodDefinitions.nodes) {
              shippingMethodNameSet.add(methodDefinition.name)
            }
          }
        }
      }
      const shippingMethodName = Array.from(shippingMethodNameSet)

      const fieldMappers: Pagination<FieldMapper> = await this.fieldMapperService.findByFilter(
        {
          implementationId,
          entityField: ShopServiceMapperFields.shippingMethod,
          entityType: EntityEnum.order
        },
        { page: 1, limit: 100 } as any
      )

      const newShippingMethods = shippingMethodName.filter(
        (shippingMethod) =>
          !fieldMappers.items.some((fieldMapper) => fieldMapper.shopValue === shippingMethod)
      )

      const newFieldMappers = this.getMappedDtoFromShopDto({
        mapType: EntityEnum.fieldMapper,
        params: { shippingMethods: newShippingMethods }
      })

      return newFieldMappers
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  private async calculateTotalSellableQuantity(
    shopifyInventoryLevel: ShopifyInventoryLevelGraphQlDto,
    inventoryItem: InventoryItem,
    physicalQuantity: number,
    manualNotConfirmedOrdersQty: number,
    implementation: Implementation,
    connection: ConnectionAuth,
    user: JwtUser
  ): Promise<number> {
    let shopifyQuantitiesForRegularItem: ShopifyQuantities = {
      committedQuantity: 0,
      unavailableQuantity: 0
    }
    let shopifyQuantitiesForBundle: Map<string, ShopifyQuantitiesForBundle> = new Map()
    let calculatedSellableQuantity = 0

    if (inventoryItem.isBundle) {
      await this.getBundleQuantitiesFromShopify(
        inventoryItem,
        shopifyQuantitiesForBundle,
        implementation,
        connection,
        user
      )
      const physicalQuantities: InventoryLevelTypeSkuImplementation[] = await lastValueFrom(
        this.inventoryLevelSourceService.getInventoryLevelQuantitiesBySkuImplementations(
          { skuImplementations: Array.from(shopifyQuantitiesForBundle.keys()) },
          user
        )
      )

      calculatedSellableQuantity = this.calculateTotalSellableQuantityForBundle(
        shopifyQuantitiesForBundle,
        physicalQuantities,
        manualNotConfirmedOrdersQty
      )

      return calculatedSellableQuantity
    }
    await this.getRegularItemQuantitiesFromShopify(
      shopifyInventoryLevel,
      inventoryItem,
      shopifyQuantitiesForRegularItem,
      implementation,
      connection,
      user
    )
    calculatedSellableQuantity =
      physicalQuantity -
      shopifyQuantitiesForRegularItem.committedQuantity -
      shopifyQuantitiesForRegularItem.unavailableQuantity -
      manualNotConfirmedOrdersQty
    return calculatedSellableQuantity
  }

  private calculateTotalSellableQuantityForBundle(
    shopifyQuantitiesForBundles: Map<string, ShopifyQuantitiesForBundle>,
    physicalQuantities: InventoryLevelTypeSkuImplementation[],
    manualNotConfirmedOrdersQty: number
  ): number {
    const sellableQuantities = []
    for (const [inventoryItemSkuImplementation, shopifyQuantities] of shopifyQuantitiesForBundles) {
      const physicalQuantity =
        physicalQuantities.find(
          (inventoryLevel) => inventoryLevel.ilsSku == inventoryItemSkuImplementation
        )?.physical ?? 0
      const physicalQuantityForBundle =
        Math.floor(physicalQuantity / shopifyQuantities.bundleQuantity) ?? 0
      sellableQuantities.push(
        physicalQuantityForBundle -
        shopifyQuantities.committedQuantity -
        shopifyQuantities.unavailableQuantity -
        manualNotConfirmedOrdersQty
      )
    }
    return sellableQuantities.length > 0 ? Math.min(...sellableQuantities) : 0
  }

  private async getRegularItemQuantitiesFromShopify(
    shopifyInventoryLevelRegularItem: ShopifyInventoryLevelGraphQlDto,
    inventoryItem: InventoryItem,
    shopifyQuantities: ShopifyQuantities,
    implementation: Implementation,
    connection: ConnectionAuth,
    user: JwtUser
  ) {
    const bundlesForComponentsShopifyInventoryIds = new Map<string, number>()

    const bundlesForComponents: InventoryBundle[] = await lastValueFrom(
      this.inventoryBundleService.getInventoryBundlesByInventoryItemSkuImplementation(
        { inventoryItemSkuImplementationIds: [inventoryItem.skuImplementation] },
        user
      )
    )
    let bundleShopifyInventoryItemIds: { [key: string]: string } = {}
    bundlesForComponents.forEach((bundleForComponent) => {
      const bundleShopifyInventoryItemId =
        bundleForComponent?.bundleInventoryItem?.metaInfo?.shopify_inventory_item_id?.toString()
      if (!bundleShopifyInventoryItemId) return
      bundlesForComponentsShopifyInventoryIds.set(
        bundleShopifyInventoryItemId,
        bundleForComponent.quantity
      )
      bundleShopifyInventoryItemIds[bundleShopifyInventoryItemId] =
        bundleForComponent.bundleInventoryItem?.metaInfo?.shopify_inventory_item_gid
    })

    const shopifyQuantitiesForBundles: ShopifyMultipleInventoryLevelGraphQlDto[] =
      await this.getQuantitiesForShopifyInventoryItemsIds(
        bundleShopifyInventoryItemIds,
        implementation,
        connection
      )

    const calculatedCommitedShopifyQuantities =
      await this.calculateCommitedShopifyQuantitiesForRegularItem(
        shopifyInventoryLevelRegularItem,
        shopifyQuantitiesForBundles,
        bundlesForComponentsShopifyInventoryIds
      )
    const calculatedUnavailableShopifyQuantities =
      await this.calculateUnavailableShopifyQuantitiesForRegularItem(
        shopifyInventoryLevelRegularItem,
        shopifyQuantitiesForBundles,
        bundlesForComponentsShopifyInventoryIds
      )

    shopifyQuantities.committedQuantity = calculatedCommitedShopifyQuantities
    shopifyQuantities.unavailableQuantity = calculatedUnavailableShopifyQuantities
  }

  private async getBundleQuantitiesFromShopify(
    inventoryItem: InventoryItem,
    calculatedShopifyQuantities: Map<string, ShopifyQuantitiesForBundle>,
    implementation: Implementation,
    connection: ConnectionAuth,
    user: JwtUser
  ) {
    const componentsToBundleShopifyInventoryIdsQuantitiy = new Map<string, BundleQuantity[]>()
    let bundleShopifyInventoryItemIds: { [key: string]: string } = {}
    let processedBundleInventoryId: string = ''

    const bundleComponents: InventoryBundle[] = await lastValueFrom(
      this.inventoryBundleService.getInventoryBundlesByBundleSkuImplementation(
        inventoryItem.skuImplementation,
        user
      )
    )
    if (!bundleComponents || bundleComponents.length == 0)
      throw new Error(
        `Bundle components not found for bundle sku implementation: ${inventoryItem.skuImplementation}`
      )

    const bundleComponentSkus = bundleComponents.map((bundleComponent) => {
      if (inventoryItem.skuImplementation == bundleComponent.bundleSkuImplementation)
        processedBundleInventoryId = bundleComponent.bundleSkuImplementation
      return bundleComponent.inventoryItemSkuImplementation
    })
    let shopifyInventoryItemsIds: { [key: string]: string } = {}
    bundleComponents.forEach((bundleComponent) => {
      if (!bundleComponent?.inventoryItem?.metaInfo?.shopify_inventory_item_id) return
      shopifyInventoryItemsIds[
        bundleComponent.inventoryItem.metaInfo?.shopify_inventory_item_id.toString()
      ] = bundleComponent.inventoryItem.metaInfo?.shopify_inventory_item_gid
    })

    const bundlesForComponents: InventoryBundle[] = await lastValueFrom(
      this.inventoryBundleService.getInventoryBundlesByInventoryItemSkuImplementation(
        { inventoryItemSkuImplementationIds: bundleComponentSkus },
        user
      )
    )

    bundlesForComponents.forEach((bundleForComponent) => {
      if (!bundleForComponent?.bundleInventoryItem?.metaInfo?.shopify_inventory_item_id) return
      bundleShopifyInventoryItemIds[
        bundleForComponent.bundleInventoryItem.metaInfo?.shopify_inventory_item_id.toString()
      ] = bundleForComponent.bundleInventoryItem.metaInfo?.shopify_inventory_item_gid
    })

    const shopifyQuantitiesForComponents: ShopifyMultipleInventoryLevelGraphQlDto[] =
      await this.getQuantitiesForShopifyInventoryItemsIds(
        shopifyInventoryItemsIds,
        implementation,
        connection
      )
    const shopifyQuantitiesForBundles: ShopifyMultipleInventoryLevelGraphQlDto[] =
      await this.getQuantitiesForShopifyInventoryItemsIds(
        bundleShopifyInventoryItemIds,
        implementation,
        connection
      )

    this.prepareRegularItemToBundleMap(
      bundlesForComponents,
      componentsToBundleShopifyInventoryIdsQuantitiy,
      shopifyQuantitiesForBundles
    )

    await this.calculateCommitedShopifyQuantitiesForBundle(
      processedBundleInventoryId,
      componentsToBundleShopifyInventoryIdsQuantitiy,
      shopifyQuantitiesForComponents,
      bundleComponents,
      calculatedShopifyQuantities
    )
    await this.calculateUnavailableShopifyQuantitiesForBundle(
      processedBundleInventoryId,
      componentsToBundleShopifyInventoryIdsQuantitiy,
      shopifyQuantitiesForComponents,
      bundleComponents,
      calculatedShopifyQuantities
    )
  }

  private prepareRegularItemToBundleMap(
    bundlesForComponents: InventoryBundle[],
    componentsToBundleShopifyInventoryIdsQuantitiy: Map<string, BundleQuantity[]>,
    shopifyQuantitiesForBundles: ShopifyMultipleInventoryLevelGraphQlDto[]
  ) {
    for (const bundleForComponent of bundlesForComponents) {
      let commitedQuantity = 0
      let unavailableQuantity = 0

      const shopifyBundleInventoryItemId =
        bundleForComponent?.bundleInventoryItem?.metaInfo?.shopify_inventory_item_id?.toString()

      const bundleForComponentSkuImplementation =
        bundleForComponent?.bundleInventoryItem?.skuImplementation
      const regularItemSkuImplementation = bundleForComponent?.inventoryItem?.skuImplementation

      const bundleQuantity = bundleForComponent.quantity
      const shopifyQuantitiesforBundle = shopifyQuantitiesForBundles.find(
        (shopifyQuantitiesForBundle) =>
          shopifyQuantitiesForBundle.inventoryItemId == shopifyBundleInventoryItemId
      )

      if (shopifyQuantitiesforBundle) {
        commitedQuantity =
          shopifyQuantitiesforBundle?.quantities.find(
            (quantity) => quantity.name === ShopifyInventoryStates.COMMITTED
          )?.quantity ?? 0

        unavailableQuantity =
          shopifyQuantitiesforBundle?.quantities.reduce((accumulator, quantity) => {
            if (ShopifyInventoryUnavailableStates.includes(quantity.name)) {
              return (accumulator += quantity.quantity)
            }
            return accumulator
          }, 0) ?? 0
      }

      if (!componentsToBundleShopifyInventoryIdsQuantitiy.has(regularItemSkuImplementation)) {
        componentsToBundleShopifyInventoryIdsQuantitiy.set(regularItemSkuImplementation, [])
      }
      componentsToBundleShopifyInventoryIdsQuantitiy.get(regularItemSkuImplementation).push({
        bundleId: shopifyBundleInventoryItemId,
        bundleSkuImplementation: bundleForComponentSkuImplementation,
        bundleQuantity: bundleQuantity,
        shopifyCommitedQuantity: commitedQuantity,
        shopifyUnavailableQuantity: unavailableQuantity
      })
    }
  }

  private async getQuantitiesForShopifyInventoryItemsIds(
    shopifyInventoryItemIds: { [key: string]: string },
    implementation: Implementation,
    connection: ConnectionAuth
  ): Promise<ShopifyMultipleInventoryLevelGraphQlDto[]> {
    if (Object.keys(shopifyInventoryItemIds).length == 0) return []

    const shopifyInventoryItemsInventoryLevels = await lastValueFrom(
      this.graphQLShopifyService.getManyInventoryItemsInventoryLevels(connection, {
        locationId: implementation?.metaInfo.shopify_location_gid,
        inventoryItemIds: shopifyInventoryItemIds
      })
    )
    if (!shopifyInventoryItemsInventoryLevels || shopifyInventoryItemsInventoryLevels.length == 0)
      return []

    return shopifyInventoryItemsInventoryLevels
  }

  private async calculateCommitedShopifyQuantitiesForRegularItem(
    shopifyInventoryLevelRegularItem: ShopifyInventoryLevelGraphQlDto,
    shopifyQuantitiesForBundles: ShopifyMultipleInventoryLevelGraphQlDto[],
    bundlesForComponentsShopifyInventoryIds: Map<string, number>
  ) {
    const committedQuantityForRegularItem =
      shopifyInventoryLevelRegularItem.quantities.find(
        (quantity) => quantity.name === ShopifyInventoryStates.COMMITTED
      )?.quantity ?? 0

    const committedQuantityForBundles = shopifyQuantitiesForBundles.reduce(
      (accumulator, shopifyQuantitiesForBundle) => {
        const componentQuantityInBundle = bundlesForComponentsShopifyInventoryIds.get(
          shopifyQuantitiesForBundle.inventoryItemId
        )
        const commitedQuantityForBundle =
          shopifyQuantitiesForBundle.quantities.find(
            (quantity) => quantity.name === ShopifyInventoryStates.COMMITTED
          )?.quantity ?? 0
        return (accumulator +=
          commitedQuantityForBundle > 0 ? commitedQuantityForBundle * componentQuantityInBundle : 0)
      },
      0
    )

    return committedQuantityForRegularItem + committedQuantityForBundles
  }

  private async calculateCommitedShopifyQuantitiesForBundle(
    processedBundleInventoryId: string,
    bundlesForComponentsShopifyInventoryIds: Map<string, BundleQuantity[]>,
    shopifyQuantitiesForComponents: ShopifyMultipleInventoryLevelGraphQlDto[],
    bundleComponents: InventoryBundle[],
    calculatedShopifyQuantities: Map<string, ShopifyQuantitiesForBundle>
  ) {
    for (const bundleComponent of bundleComponents) {
      let quantityForProcessedBundle = 0
      let commitedQuantitiesForBundle = 0
      let totalCommitedQuantities = 0

      const shopifyInventoryItemId =
        bundleComponent?.inventoryItem?.metaInfo?.shopify_inventory_item_id
      const bundleComponentSkuImplementation = bundleComponent?.inventoryItem?.skuImplementation
      const bundleQuantities = bundlesForComponentsShopifyInventoryIds.get(
        bundleComponentSkuImplementation
      )
      const shopifyQuantitiesForComponent = shopifyQuantitiesForComponents.find(
        (shopifyQuantitiesForComponent) =>
          shopifyQuantitiesForComponent.inventoryItemId == shopifyInventoryItemId
      )

      const commitedQuantitiesForRegularItem =
        shopifyQuantitiesForComponent?.quantities?.find(
          (quantity) => quantity.name === ShopifyInventoryStates.COMMITTED
        )?.quantity ?? 0

      commitedQuantitiesForBundle = bundleQuantities
        ? bundleQuantities.reduce((accumulator, bundleQuantity) => {
          if (bundleQuantity.bundleSkuImplementation == processedBundleInventoryId)
            quantityForProcessedBundle = bundleQuantity.bundleQuantity
          const commitedQuantityForBundle = bundleQuantity.shopifyCommitedQuantity
          return (accumulator +=
            commitedQuantityForBundle > 0
              ? commitedQuantityForBundle * bundleQuantity.bundleQuantity
              : 0)
        }, 0)
        : 0

      totalCommitedQuantities = commitedQuantitiesForRegularItem + commitedQuantitiesForBundle
      const committedQuantity =
        totalCommitedQuantities > 0 && quantityForProcessedBundle > 0
          ? Math.ceil(totalCommitedQuantities / quantityForProcessedBundle)
          : 0
      const existingQuantities = calculatedShopifyQuantities.get(
        bundleComponent.inventoryItemSkuImplementation
      )

      calculatedShopifyQuantities.set(bundleComponent.inventoryItemSkuImplementation, {
        committedQuantity: committedQuantity,
        unavailableQuantity: existingQuantities?.unavailableQuantity ?? 0,
        bundleQuantity: bundleComponent.quantity
      })
    }
  }
  private async calculateUnavailableShopifyQuantitiesForBundle(
    processedBundleInventoryId: string,
    bundlesForComponentsShopifyInventoryIds: Map<string, BundleQuantity[]>,
    shopifyQuantitiesForComponents: ShopifyMultipleInventoryLevelGraphQlDto[],
    bundleComponents: InventoryBundle[],
    calculatedShopifyQuantities: Map<string, ShopifyQuantitiesForBundle>
  ) {
    for (const bundleComponent of bundleComponents) {
      let quantityForProcessedBundle: number = 0
      let unavailableQuantitiesForBundle: number = 0
      let totalUnavailableQuantities: number = 0
      const shopifyInventoryItemId =
        bundleComponent?.inventoryItem?.metaInfo?.shopify_inventory_item_id
      const bundleComponentSkuImplementation = bundleComponent?.inventoryItem?.skuImplementation
      const bundleQuantities = bundlesForComponentsShopifyInventoryIds.get(
        bundleComponentSkuImplementation
      )
      const shopifyQuantitiesForComponent = shopifyQuantitiesForComponents.find(
        (shopifyQuantitiesForComponent) =>
          shopifyQuantitiesForComponent.inventoryItemId == shopifyInventoryItemId
      )

      const unavailableQuantitiesForRegularItem =
        shopifyQuantitiesForComponent?.quantities.reduce((accumulator, quantity) => {
          if (ShopifyInventoryUnavailableStates.includes(quantity.name)) {
            return (accumulator += quantity.quantity)
          }
          return accumulator
        }, 0) ?? 0

      unavailableQuantitiesForBundle = bundleQuantities
        ? bundleQuantities.reduce((accumulator, bundleQuantity) => {
          if (bundleQuantity.bundleSkuImplementation == processedBundleInventoryId)
            quantityForProcessedBundle = bundleQuantity.bundleQuantity
          const unavailableQuantityForBundle = bundleQuantity.shopifyUnavailableQuantity
          return (accumulator +=
            unavailableQuantityForBundle > 0
              ? unavailableQuantityForBundle * bundleQuantity.bundleQuantity
              : 0)
        }, 0)
        : 0

      totalUnavailableQuantities =
        unavailableQuantitiesForRegularItem + unavailableQuantitiesForBundle
      const unavailableQuantity =
        totalUnavailableQuantities > 0
          ? Math.ceil(totalUnavailableQuantities / quantityForProcessedBundle)
          : 0
      const existingQuantities = calculatedShopifyQuantities.get(
        bundleComponent.inventoryItemSkuImplementation
      )

      calculatedShopifyQuantities.set(bundleComponent.inventoryItemSkuImplementation, {
        committedQuantity: existingQuantities?.committedQuantity ?? 0,
        unavailableQuantity: unavailableQuantity,
        bundleQuantity: bundleComponent.quantity
      })
    }
  }

  private async calculateUnavailableShopifyQuantitiesForRegularItem(
    shopifyInventoryLevelRegularItem: ShopifyInventoryLevelGraphQlDto,
    shopifyQuantitiesForBundles: ShopifyMultipleInventoryLevelGraphQlDto[],
    bundlesForComponentsShopifyInventoryIds: Map<string, number>
  ) {
    let unavailableQuantityForRegularItem = 0

    ShopifyInventoryUnavailableStates.forEach((key) => {
      const quantity =
        shopifyInventoryLevelRegularItem.quantities.find((quantity) => quantity.name == key)
          ?.quantity ?? 0
      unavailableQuantityForRegularItem += quantity
    })

    const unavailableQuantityForBundles = shopifyQuantitiesForBundles.reduce(
      (accumulator, shopifyQuantitiesForBundle) => {
        const bundleQuantity = bundlesForComponentsShopifyInventoryIds.get(
          shopifyQuantitiesForBundle.inventoryItemId
        )
        const unavailableQuantityForBundle = shopifyQuantitiesForBundle.quantities.reduce(
          (accumulator, quantity) => {
            if (ShopifyInventoryUnavailableStates.includes(quantity.name)) {
              return (accumulator += quantity.quantity)
            }
            return accumulator
          },
          0
        )
        return (accumulator +=
          unavailableQuantityForBundle > 0 ? unavailableQuantityForBundle * bundleQuantity : 0)
      },
      0
    )

    return unavailableQuantityForRegularItem + unavailableQuantityForBundles
  }

  async syncInventoryItemGid(message: RoutedMessage) {
    try {
      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)

      const user: JwtUser = this.getUser(message)
      const inventoryItems = await lastValueFrom(
        this.inventoryItemsService.filterInventoryItemsNotContainGID(message.implementationId, user)
      )

      if (!inventoryItems.length) {
        this.logger.log('[syncInventoryItemGid] no inventory items to sync to add metaInfo')
        return
      }

      const customerItemIdsQuery = inventoryItems
        .filter((inventoryItem) => {
          return parseInt(inventoryItem.customerItemId) > 0 // Shopify query only accept positive ids
        })
        .map((inventoryItem) => `id:${inventoryItem.customerItemId}`)
        .join(' OR ')

      const query: QueryProductMetaInfoDto = {
        product_status: 'active',
        customerItemIdsQuery,
        limit: 250
      }

      const productVariantsMetaInfoArr: ShopifyProductVariantMetaInfoGraphQlDto[] = []
      let pageInfoResponse: PageInfoDto = { hasNextPage: false, endCursor: null }

      while (true) {
        const { pageInfo, productVariantsMetaInfo } = await lastValueFrom(
          this.graphQLShopifyService.getProductMetaInfo(connection, {
            nextPage: pageInfoResponse,
            query
          })
        )
        pageInfoResponse = pageInfo
        productVariantsMetaInfoArr.push(...productVariantsMetaInfo)
        if (!pageInfoResponse?.hasNextPage) {
          break
        }
      }

      if (!productVariantsMetaInfoArr.length) {
        this.logger.log('[syncInventoryItemGid] no valid inventory items to sync to add metaInfo')
        return
      }

      this.logger.log({
        message: '[syncInventoryItemGid] inventory items',
        data: {
          inventoryItems: inventoryItems.length,
          productVariantsMetaInfoArr: productVariantsMetaInfoArr.length
        }
      })

      const mappedProductVariantsMetaInfo: any[] =
        productVariantsMetaInfoArr.map((productVariant) => {
          return {
            customerItemId: productVariant.legacyResourceId,
            implementationId: message.implementationId,
            metaInfo: {
              shopify_product_variant_gid: productVariant.id,
              shopify_inventory_item_gid: productVariant.inventoryItem.id
            }
          }
        })
      await lastValueFrom(
        this.inventoryItemsService.putInventoryItemsGID(mappedProductVariantsMetaInfo, user)
      )
      return
    } catch (error) {
      throw error
    }
  }

  async syncFulfillmentOrdersGid(message: RoutedMessage) {
    try {
      const connection =
        await this.connectionAuthsService.getConnectionPool<OrgType.Shop>(message)

      const user: JwtUser = this.getUser(message)

      const orders = await lastValueFrom(
        this.ordersService.filterOrdersNotContainGIDAndNotContainSpecifiedStatus(
          message.implementationId,
          user
        )
      )

      if (!orders.length) {
        this.logger.log('[syncFulfillmentOrdersGid] no orders to sync to add metaInfo')
        return
      }

      this.logger.log('[syncFulfillmentOrdersGid] total fetched orders', orders.length)

      const fulfillmentOrdersIds = orders
        .filter((order) => {
          return parseInt(order.metaInfo.fulfillment_order_id) > 0 // Shopify query only accept positive ids
        })
        .map((order) => `id:${order.metaInfo.fulfillment_order_id}`)
        .join(' OR ')

      const query: QueryFulfillmentOrderMetaInfoDto = {
        fulfillmentOrdersIds,
        limit: 100
      }

      let pageInfoResponse: PageInfoDto = { hasNextPage: false, endCursor: null }

      while (true) {
        const { pageInfo, fulfillmentOrderMetaInfo } = await lastValueFrom(
          this.graphQLShopifyService.getFulfillmentOrdersMetaInfo(connection, {
            nextPage: pageInfoResponse,
            query
          })
        )
        pageInfoResponse = pageInfo

        if (!fulfillmentOrderMetaInfo.length) {
          this.logger.log(
            '[syncFulfillmentOrdersGid] no valid fulfillment order ids to sync to add metaInfo'
          )
          return
        }

        this.logger.log(
          `[syncFulfillmentOrdersGid] total shopify fulfillment orders length ${fulfillmentOrderMetaInfo.length}`
        )

        const mappedOrderMetaInfo: PutOrderGidDto[] = fulfillmentOrderMetaInfo.map(
          (fulfillmentOrderMetaInfo) => {
            return {
              customerOrderId: fulfillmentOrderMetaInfo.order.legacyResourceId,
              fulfillmentOrderId: GraphQlIdConverter.convertFromGraphqlId(
                fulfillmentOrderMetaInfo.id
              ),
              implementationId: connection.implementationId,
              orderMetaInfo: {
                shopify_order_gid:
                  fulfillmentOrderMetaInfo.orderId as ShopifyGraphQLId<ShopifyResources.Order>,
                shopify_fulfillment_order_gid:
                  fulfillmentOrderMetaInfo.id as ShopifyGraphQLId<ShopifyResources.FulfillmentOrder>
              },
              orderItemsInfo: fulfillmentOrderMetaInfo.lineItems.nodes.map(
                (fulfillmentLineItem) => {
                  return {
                    customerLineItemId: GraphQlIdConverter.convertFromGraphqlId(
                      fulfillmentLineItem.lineItem.id
                    ),
                    fulfillmentOrderLineItemId: GraphQlIdConverter.convertFromGraphqlId(
                      fulfillmentLineItem.id
                    ),
                    orderItemsMetaInfo: {
                      shopify_order_line_item_gid: fulfillmentLineItem.lineItem
                        .id as ShopifyGraphQLId<ShopifyResources.LineItem>,
                      shopify_fulfillment_order_line_item_gid:
                        fulfillmentLineItem.id as ShopifyGraphQLId<ShopifyResources.FulfillmentOrderLineItem>
                    }
                  }
                }
              )
            }
          }
        )

        await lastValueFrom(this.ordersService.putFulfillmentOrderGid(mappedOrderMetaInfo as any, user))

        if (!pageInfoResponse?.hasNextPage) {
          break
        }
      }
      return
    } catch (error) {
      throw error
    }
  }

  async getInventoryItemShopStockLevels(
    inventoryItem: InventoryItem,
    connection: ConnectionAuth
  ): Promise<GetInventoryItemShopStockLevelsResponseDto> {
    try {
      const shopifyInventoryLevels = await lastValueFrom(
        this.graphQLShopifyService.getInventoryLevels(connection, {
          query: {
            locationId: inventoryItem.implementation?.metaInfo.shopify_location_gid,
            inventoryItemId: inventoryItem.metaInfo.shopify_inventory_item_gid
          }
        })
      )

      let responseObject = {} as IGetInventoryItemShopifyStockLevelsResponse

      shopifyInventoryLevels?.quantities.forEach((inventoryLevel) => {
        responseObject[inventoryLevel.name] = inventoryLevel.quantity
      })
      return responseObject
    } catch (error) {
      throw error
    }
  }

  async createShopIntegration(
    createDto: CreateShopifyIntregrationDto,
    user: JwtUser
  ): Promise<ConnectionAuth> {
    try {
      const isConnectionAuthExistsForImplementation = await this.connectionAuthRepository.findOne({
        where: {
          implementationId: createDto.implementationId,
          targetSystem: TargetSystemEnum.SHOPIFY
        }
      })
      if (isConnectionAuthExistsForImplementation) {
        throw new HttpException(`Connection Auth already exists for implementationId ${createDto.implementationId}.`, 409)
      }

      const shopUrl = createDto.shop.startsWith('https://') ? createDto.shop : `https://${createDto.shop}`

      const isConnectionAuthExists = await this.connectionAuthRepository.findOne({
        where: {
          connectionUrl: shopUrl,
          targetSystem: TargetSystemEnum.SHOPIFY
        }
      })

      if (isConnectionAuthExists)
        throw new HttpException(`Connection Auth already exists for shopUrl ${shopUrl}.`, 409)

      const implementation = await lastValueFrom(
        this.implementationsService.getImplementation(createDto.implementationId, user)
      )
      if (!implementation) {
        throw new NotFoundException(`Implementation not found for id ${createDto.implementationId}`)
      }

      // Get credentials
      const clientId = createDto.clientId || process.env.SHOPIFY_CLIENT_ID
      const clientSecret = createDto.clientSecret || process.env.SHOPIFY_CLIENT_SECRET
      if (!clientId || !clientSecret) {
        throw new BadRequestException('Shopify client credentials are not configured')
      }

      // Exchange code for token
      const tokenResponse = await lastValueFrom(
        this.httpShopifyService.exchangeOAuthCodeForToken(shopUrl, createDto.code, clientId, clientSecret)
      ).catch(error => {
        this.logger.error('Failed to exchange OAuth code for token', error)
        throw new BadRequestException('Failed to obtain access token from Shopify. Please check the authorization code.')
      })

      const createConnectionAuthDto: CreateConnectionAuthDto = {
        authObject: {
          keyName: 'X-Shopify-Access-Token',
          token: tokenResponse.access_token
        },
        authStrategy: 'auth-token',
        isActive: true,
        targetType: OrgType.Shop,
        targetSystem: TargetSystemEnum.SHOPIFY,
        targetTypeId: implementation.customerId,
        implementationId: createDto.implementationId,
        metaInfo: {},
        connectionUrl: shopUrl
      }

      const createdConnectionAuth = await this.connectionAuthsService.create(
        createConnectionAuthDto,
        user
      )

      const connectionAuth = await this.connectionAuthsService.findOne(
        createdConnectionAuth.id,
        user
      )

      const fulfillmentService = await this.createFulfillmentService(
        connectionAuth,
        user
      )

      await this.implementationsService.update(
        implementation.id,
        {
          customerLocationId: fulfillmentService.location_id.toString(),
          metaInfo: {
            shopify_location_gid: fulfillmentService.location_gid
          }
        },
        user
      )

      return connectionAuth
    } catch (error) {
      this.logger.error('Error in createShopifyOAuthConnectionAuth', error)
      throw error
    }
  }
}
