import { IPaginationOptions, Pagination } from '../core/types/common.types'
import { Injectable, Logger } from '@nestjs/common'
import { ContextIdFactory, ModuleRef } from '@nestjs/core'
import { Observable } from 'rxjs'
import { ConnectionAuthsService } from '../connection-auths/connection-auths.service'
import {
  CreateConnectionAuthDto,
  CreateShopifyIntregrationDto
} from '../connection-auths/dtos/create-connection-auth.dto'
import { QueryConnectionAuthsDto } from '../connection-auths/dtos/query-connection-auths.dto'
import { UpdateConnectionAuthDto } from '../connection-auths/dtos/update-connection-auth.dto'
import { ConnectionAuth } from '../connection-auths/entities/connection-auth.entity'
import { TestConnectionResponseInterface } from '../connection-auths/interface/test-connection-response.interface'
import { PaginatedResult } from '../core/interfaces/pagination-result.interface'
import { FieldMapper } from '../field-mapper/entities/field-mapper.entity'
import { QueryFieldMapper } from '../field-mapper/interfaces/query-field-mapper.interface'
import { ImplementationsService } from '../implementations/implementations.service'
import { InventoryBundlesService } from '../inventory-bundles/inventory-bundles.service'
import { InventoryItemsService } from '../inventory-items/inventory-items.service'
import { InventoryLevelSourceService } from '../inventory-level-source/inventory-level-source.service'
import { OrdersService } from '../orders/orders.service'
import { OutboundShipmentsService } from '../outbound-shipments/outbound-shipments.service'
import { RefundOrdersService } from '../refund-orders/refund-orders.service'
import { ReturnShipmentsService } from '../return-shipments/return-shipments.service'
import { ShopConnectorsService } from '../shop-connectors/shop-connectors.service'
import { ShopifyService } from '../shop-connectors/shopify/shopify.service'
import GetInventoryItemShopStockLevelsResponseDto from './dtos/get-inventory-item-shop-stock-levels-response.dto'

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name)
  private shopConnectorsService: ShopConnectorsService

  constructor(
    private moduleRef: ModuleRef,
    private implementationService: ImplementationsService,
    private ordersService: OrdersService,
    private outboundShipmentService: OutboundShipmentsService,
    private returnShipmentService: ReturnShipmentsService,
    private inventoryItemService: InventoryItemsService,
    private readonly inventoryBundlesService: InventoryBundlesService,
    private inventoryLevelSourceService: InventoryLevelSourceService,
    private connectionAuthsService: ConnectionAuthsService,
    private refundOrdersService: RefundOrdersService,
    private shopifyService: ShopifyService
  ) {
    this.transientResolver()
  }

  async transientResolver() {
    try {
      const contextId = ContextIdFactory.create()
      this.shopConnectorsService = await this.moduleRef.resolve(ShopConnectorsService, contextId, {
        strict: false
      })
    } catch (err) {
      this.logger.error(err, err?.stack)
      throw err
    }
  }

  testConnection(connAuthId: number): Promise<TestConnectionResponseInterface> {
    return this.connectionAuthsService.testConnection(connAuthId)
  }

  filterConnectionAuths(
    queryDto: QueryConnectionAuthsDto,
    options: IPaginationOptions,
    user: any
  ): Promise<Pagination<ConnectionAuth>> {
    return this.connectionAuthsService.findByFilter(queryDto, options, user)
  }

  updateConnectionAuth(
    id: number,
    updateConnectionAuthDto: UpdateConnectionAuthDto,
    user?: any
  ) {
    return this.connectionAuthsService.update(id, updateConnectionAuthDto, user)
  }

  getConnectionAuth(id: number, user?: any): Promise<ConnectionAuth> {
    return this.connectionAuthsService.findOne(id, user)
  }

  filterImplementations(
    queryImplementationDto: any,
    user: any
  ): Observable<Pagination<any>> {
    return this.implementationService.filterImplementations(queryImplementationDto, user)
  }

  getImplementation(id: number, user: any): Observable<any> {
    return this.implementationService.getImplementation(id, user)
  }

  getAggregatedByStatus(
    status: any,
    user: any
  ): Observable<any> {
    return this.ordersService.getAggregatedByStatus(status, user)
  }

  filterOrders(queryOrderDto: any, user: any): Observable<PaginatedResult<any>> {
    return this.ordersService.filterOrders(queryOrderDto, user)
  }

  filterOrderByCurrentStatus(
    queryOrderDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.ordersService.filterOrderByCurrentStatus(queryOrderDto, user)
  }

  async getOrder(id: number, user: any): Promise<any> {
    return await this.ordersService.getOrderWithChangeableTimestamp(id, user)
  }

  fulfillmentStatusCheck(
    payload: any,
    user: any
  ): Observable<any> {
    return this.ordersService.fulfillmentStatusCheck(payload, user)
  }

  checkFulfillmentAndLogHistory(
    payload: any,
    user: any,
    isCheckForOnHoldOrders: boolean
  ): Observable<any> {
    return this.ordersService.checkFulfillmentAndLogHistory(payload, user, isCheckForOnHoldOrders)
  }

  async createOrder(createOrderDto: any, user: any): Promise<Observable<any>> {
    ; (createOrderDto.orderHistories || []).map((historyObj) =>
      this.setHistoryTimestamps(historyObj, {
        shopCreatedAt: historyObj.shopCreatedAt || new Date()
      })
    )

    if (createOrderDto?.customerOrderNumber) {
      let date = new Date()
      createOrderDto.customerOrderNumber = `W${date.getDate()}${date.getMilliseconds()}_${createOrderDto.customerOrderNumber}`
    }

    if (createOrderDto.channel === 'manual') {
      createOrderDto.customerOrderId = createOrderDto.customerOrderId
        ? `wh1_manual_${Date.now()}_${createOrderDto.customerOrderId}`
        : `wh1_manual_${Date.now()}`
    }

    return this.ordersService.createOrder(createOrderDto, user)
  }

  updateOrder(id: number, updateOrderDto: any, user: any): Observable<any> {
    return this.ordersService.updateOrder(id, updateOrderDto, user)
  }

  releaseOrders(releaseOrderDto: any, user: any): Promise<void> {
    return this.ordersService.releaseOrders(releaseOrderDto, user)
  }

  updateOrCreateOrders(
    orderDtoList: any[],
    user?: any
  ): Observable<any> {
    return this.ordersService.updateOrCreateOrders(orderDtoList, user)
  }

  filterOrderHistories(
    queryOrderHistoryDto: any,
    user: any
  ): Observable<any[]> {
    return this.ordersService.filterOrderHistories(queryOrderHistoryDto, user)
  }

  getOrderHistory(id: number, user: any): Observable<any> {
    return this.ordersService.getOrderHistory(id, user)
  }

  createOrderHistory(
    createOrderHistoryDto: any,
    user: any
  ): Observable<any> {
    this.setHistoryTimestamps(createOrderHistoryDto, {
      shopCreatedAt: createOrderHistoryDto.shopCreatedAt || new Date()
    })
    return this.ordersService.createOrderHistory(createOrderHistoryDto, user)
  }

  updateOrderHistory(
    id: number,
    updateOrderHistoryDto: any,
    user: any
  ): Observable<any> {
    this.setHistoryTimestamps(updateOrderHistoryDto, {
      shopUpdatedAt: updateOrderHistoryDto.shopUpdatedAt,
      shopCreatedAt: updateOrderHistoryDto.shopCreatedAt,
      wmsCreatedAt: updateOrderHistoryDto.wmsCreatedAt
    })
    return this.ordersService.updateOrderHistory(id, updateOrderHistoryDto, user)
  }

  filterOrderItems(
    queryOrderItemDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.ordersService.filterOrderItems(queryOrderItemDto, user)
  }

  getOrderItem(id: number, user: any): Observable<any> {
    return this.ordersService.getOrderItem(id, user)
  }

  updateOrderItem(
    id: number,
    updateOrderItemDto: any,
    user: any
  ): Observable<any> {
    return this.ordersService.updateOrderItem(id, updateOrderItemDto, user)
  }

  filterOutboundShipments(
    queryOutboundShipmentDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.outboundShipmentService.filterOutboundShipments(queryOutboundShipmentDto, user)
  }

  getSerialNumbers(user: any) {
    return this.outboundShipmentService.getSerialNumbers(user)
  }

  getLotNumbers(user: any) {
    return this.outboundShipmentService.getLotNumbers(user)
  }

  getOutboundShipment(id: number, user: any): Observable<any> {
    return this.outboundShipmentService.getOutboundShipment(id, user)
  }

  filterReturnShipments(
    queryReturnShipmentDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.returnShipmentService.filterReturnShipments(queryReturnShipmentDto, user)
  }

  getReturnShipment(id: number, user: any): Observable<any> {
    return this.returnShipmentService.getReturnShipment(id, user)
  }

  filterInventoryItems(
    queryInventoryItemDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.inventoryItemService.filterInventoryItems(queryInventoryItemDto, user)
  }

  getInventoryItem(id: number, user: any): Observable<any> {
    return this.inventoryItemService.getInventoryItem(id, user)
  }

  createInventoryItem(
    createInventoryItemDto: any,
    user: any
  ): Observable<any> {
    this.syncShopInventoryTimestamps(createInventoryItemDto)
    return this.inventoryItemService.createInventoryItem(createInventoryItemDto, user)
  }

  updateInventoryItem(
    id: number,
    updateInventoryItemDto: any,
    isInternalUpdate: boolean,
    user: any
  ): Observable<any> {
    this.syncShopInventoryTimestamps(updateInventoryItemDto)
    return this.inventoryItemService.updateInventoryItem(
      id,
      updateInventoryItemDto,
      isInternalUpdate,
      user
    )
  }

  updateReturnPeriod(
    implementationId: number,
    updateReturnPeriodDto: any,
    user: any
  ): Observable<any> {
    return this.inventoryItemService.updateReturnPeriod(
      implementationId,
      updateReturnPeriodDto,
      user
    )
  }

  getReturnPeriod(implementationId: number, user: any): Observable<any> {
    return this.inventoryItemService.getReturnPeriod(implementationId, user)
  }

  bulkUpdateInventoryItem(
    updateDto: any[],
    isInternalUpdate: boolean,
    user: any
  ): Observable<any> {
    return this.inventoryItemService.bulkUpdateInventoryItems(updateDto, isInternalUpdate, user)
  }

  getInventoryItemsCountAggregatedByStatus(
    aggregateByStatusInventoryItemDto: any,
    user: any
  ): Observable<any> {
    return this.inventoryItemService.getInventoryItemsCountAggregatedByStatus(
      aggregateByStatusInventoryItemDto,
      user
    )
  }

  setHistoryTimestamps(
    historyObject: any,
    modifyParams: { shopCreatedAt?: Date; shopUpdatedAt?: Date; wmsCreatedAt?: Date }
  ) {
    historyObject.source = 'Shop' // OrgType.Shop equivalent
    delete historyObject.wmsCreatedAt
    delete historyObject.wmsUpdatedAt

    if (modifyParams.wmsCreatedAt) {
      historyObject.wmsCreatedAt = modifyParams.wmsCreatedAt
    }

    if (modifyParams.shopCreatedAt) {
      historyObject.shopCreatedAt = modifyParams.shopCreatedAt
    }
    if (modifyParams.shopUpdatedAt) {
      historyObject.shopUpdatedAt = modifyParams.shopUpdatedAt
    }
  }

  syncShopInventoryTimestamps(
    inventoryItemDto: any
  ): void {
    inventoryItemDto.shopSyncedAt = inventoryItemDto.shopSyncedAt || new Date()
    inventoryItemDto.wmsSyncedAt = undefined
  }

  getInventoryBundle(id: number, user: any): Observable<any> {
    return this.inventoryBundlesService.getInventoryBundle(id, user)
  }

  filterInventoryBundles(
    queryDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.inventoryBundlesService.filterInventoryBundles(queryDto, user)
  }

  createInventoryBundle(
    createDto: any,
    user: any
  ): Observable<any> {
    return this.inventoryBundlesService.createInventoryBundle(createDto, user)
  }

  async updateInventoryBundle(
    id: number,
    updateDto: any,
    user: any
  ): Promise<any> {
    return this.inventoryBundlesService.updateInventoryBundle(id, updateDto, user)
  }

  removeInventoryBundle(id: number, user: any): Observable<any> {
    return this.inventoryBundlesService.removeInventoryBundle(id, user)
  }

  getInventoryBundlesByBundleSkuImplementation(
    bundleSkuImplementationCsv: string,
    user: any
  ): Observable<any[]> {
    return this.inventoryBundlesService.getInventoryBundlesByBundleSkuImplementation(
      bundleSkuImplementationCsv,
      user
    )
  }

  getInventoryLevelSourceItem(id: number, user: any): Observable<any> {
    return this.inventoryLevelSourceService.getInventoryLevelSource(id, user)
  }

  filterInventoryLevelSourceItems(
    queryDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.inventoryLevelSourceService.filterInventoryLevelSources(queryDto, user)
  }

  filterRefundOrders(
    queryRefundOrderDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.refundOrdersService.filterRefundOrders(queryRefundOrderDto, user)
  }

  getRefundOrder(id: number, user: any): Observable<any> {
    return this.refundOrdersService.getRefundOrder(id, user)
  }

  filterRefundOrderItems(
    queryRefundOrderItemDto: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.refundOrdersService.filterRefundOrderItems(queryRefundOrderItemDto, user)
  }

  getRefundOrderItem(id: number, user: any): Observable<any> {
    return this.refundOrdersService.getRefundOrderItem(id, user)
  }

  calculateRefundOrder(
    refundOrderDto: any,
    user: any
  ): Promise<any> {
    return this.shopConnectorsService.calculateRefundOrder(refundOrderDto)
  }

  createRefundOrder(
    refundOrderDto: any,
    user: any
  ): Promise<any> {
    return this.shopConnectorsService.createRefundOrder(refundOrderDto)
  }

  updateInventoryItemActiveStatus(
    data: any,
    id: number,
    user: any
  ): Observable<any> {
    return this.inventoryItemService.updateInventoryItemActiveStatus(data, id, user)
  }

  async getInventoryItemShopStockLevels(
    inventoryItemId: number,
    user: any
  ): Promise<GetInventoryItemShopStockLevelsResponseDto> {
    return this.shopConnectorsService.getInventoryItemShopStockLevels(inventoryItemId, user)
  }

  getShippingMethod(queryFieldMapper: QueryFieldMapper): Promise<FieldMapper[]> {
    return this.shopConnectorsService.getShippingMethod(queryFieldMapper)
  }

  filterOrderTags(
    query: any,
    user: any
  ): Observable<PaginatedResult<any>> {
    return this.ordersService.filterOrderTags(query, user)
  }

  getOrderTag(id: number, user: any): Observable<any> {
    return this.ordersService.getOrderTag(id, user)
  }

  createOrderTag(createOrderTagDto: any, user: any): Observable<any> {
    return this.ordersService.createOrderTag(createOrderTagDto, user)
  }

  searchOrderTags(tagName: string, user: any): Observable<Array<any>> {
    return this.ordersService.searchOrderTags(tagName, user)
  }

  createConnectionAuth(
    createConnectionAuthDto: CreateConnectionAuthDto,
    user?: any
  ): Promise<ConnectionAuth> {
    return this.connectionAuthsService.create(createConnectionAuthDto, user)
  }

  createShopifyAppConnectionAuth(
    createShopifyIntregrationDto: CreateShopifyIntregrationDto,
    user?: any
  ): Promise<ConnectionAuth> {
    return this.shopifyService.createShopIntegration(createShopifyIntregrationDto, user)
  }

  async handleShopifyWebhook(data) {
    return await this.shopifyService.handleShopifyWebhook(data)
  }
}
