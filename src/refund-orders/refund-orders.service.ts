import { JwtUser } from '../core/types/common.types'
import { Role } from '../shop-connectors/shopify/entities/enums.entity'
import { CalculateRefundOrderDto } from './dtos/calculate-refund-order.dto'
import { CalculateRefundOrderItemDto } from './dtos/calculate-refund-order-item.dto'
import { CalculateRefundOrderResponseDto } from './dtos/calculate-refund-order-response.dto'
import { CreateRefundOrderDto } from './dtos/create-refund-order.dto'
import { QueryRefundOrderDto } from './dtos/query-refund-order.dto'
import { QueryRefundOrderItemDto } from './dtos/query-refund-order-item.dto'
// Entity types - using any since entities are not defined locally
type RefundOrder = any
type RefundOrderItem = any
type Order = any
type OrderItem = any
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { of, Observable, lastValueFrom } from 'rxjs'
import { PaginatedResult } from '../core/interfaces/pagination-result.interface'
import { OrdersService } from '../orders/orders.service'
import { RefundOrderMapper } from './mappers/refund-order.mapper'

@Injectable()
export class RefundOrdersService {
  private readonly logger = new Logger(RefundOrdersService.name)
  constructor(
    private ordersService: OrdersService
  ) {}

  filterRefundOrders(
    queryRefundOrderDto: QueryRefundOrderDto,
    user: JwtUser
  ): Observable<PaginatedResult<RefundOrder>> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getRefundOrder(id: number, user: JwtUser): Observable<RefundOrder> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  createRefundOrder(
    createRefundOrderDto: CreateRefundOrderDto,
    user: JwtUser
  ): Observable<RefundOrder> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  filterRefundOrderItems(
    queryRefundOrderItemDto: QueryRefundOrderItemDto,
    user: JwtUser
  ): Observable<PaginatedResult<RefundOrderItem>> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getRefundOrderItem(id: number, user: JwtUser): Observable<RefundOrderItem> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  async calculateRefundOrder(
    refundOrderDto: CalculateRefundOrderDto
  ): Promise<CalculateRefundOrderResponseDto> {
    try {
      let user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        entityRole: Role.ShopUser,
        entityId: 1,
        implementationId: refundOrderDto?.implementationId,
        implementationIds: `${refundOrderDto?.implementationId}`
      }

      const order: Order = await lastValueFrom(
        this.ordersService.getOrder(refundOrderDto.orderId, user)
      )
      if (!order) {
        throw new NotFoundException(`Order not found with orderId :${refundOrderDto.orderId}`)
      }

      let totalOrderItemQuantity = 0

      const orderItemsByIdHash = order.orderItems.reduce((accu, orderItem) => {
        accu[orderItem.id] = orderItem
        totalOrderItemQuantity += orderItem.quantity
        return accu
      }, {})

      const returnOrderItemHash = refundOrderDto.orderItems.reduce(
        (accu, orderItem: CalculateRefundOrderItemDto) => {
          accu[orderItem.orderItemId] = {
            sku: orderItem.sku,
            skuImplementation: `${orderItem.sku}_${refundOrderDto.implementationId}`,
            quantity: orderItem.quantity
          }
          return accu
        },
        {}
      )

      const refundOrderItemIds = Object.keys(returnOrderItemHash).map(Number)
      const deepCloneOrderItems: Partial<OrderItem>[] = JSON.parse(JSON.stringify(order.orderItems))

      const returnOrderItems: Partial<OrderItem>[] = (deepCloneOrderItems?.reduce(
        (accu, cloneOrderItem) => {
          const cloneOrderItemId = String(cloneOrderItem.id)
          if (returnOrderItemHash[cloneOrderItemId]) {
            const isQuantityExceeded =
              returnOrderItemHash[cloneOrderItemId].quantity > cloneOrderItem.quantity

            if (isQuantityExceeded) {
              throw new BadRequestException(
                `Requested refund quantity for orderItemId: ${cloneOrderItem.id} is greater than orderItem quantity: ${cloneOrderItem.quantity}`
              )
            }
          }

          const isRequestedOrderItem = refundOrderItemIds.indexOf(cloneOrderItem.id) !== -1
          if (isRequestedOrderItem) {
            cloneOrderItem.quantity = returnOrderItemHash[cloneOrderItemId].quantity
            accu.push(cloneOrderItem)
          }

          return accu
        },
        []
      ) || []) as Partial<OrderItem>[]

      const refundOrder = RefundOrderMapper.mapFrom(returnOrderItems, {
        orderItemsByIdHash: orderItemsByIdHash,
        order: order,
        totalOrderItemQuantity,
        returnShipmentId: refundOrderDto.returnShipmentId,
        refundShipping: refundOrderDto.refundShipping
      })

      return refundOrder as CalculateRefundOrderResponseDto
    } catch (error) {
      throw error
    }
  }

  async createRefundOrderAfterRefundCalculation(
    refundOrderDto: CalculateRefundOrderResponseDto
  ): Promise<RefundOrder> {
    try {
      const { refundOrder } = refundOrderDto
      let user: JwtUser = {
        id: 0,
        email: 'system@demo.com',
        role: Role.ShopUser,
        entityRole: Role.ShopUser,
        entityId: 1,
        implementationId: refundOrder.implementationId,
        implementationIds: `${refundOrder.implementationId}`
      }

      const order: Order = await lastValueFrom(
        this.ordersService.getOrder(refundOrderDto.refundOrder.orderId, user)
      )

      if (!order) {
        throw new NotFoundException(
          `Order not found with orderId :${refundOrderDto.refundOrder.orderId}`
        )
      }

      const hasOrderItems = order?.orderItems?.length > 0
      if (!hasOrderItems) {
        throw new NotFoundException(
          `Order Items not found for orderId :${refundOrderDto.refundOrder.orderId}`
        )
      }

      if (refundOrder?.refundOrderItems?.length === 0) {
        this.logger.warn(`No refundOrderItems available for orderId: ${refundOrder.orderId}`)
        return null
      }

      const refundOrderResponse = await lastValueFrom(this.createRefundOrder(refundOrder, user))
      this.logger.log({
        message: 'Refund order is created successfully in the middleware',
        data: refundOrderResponse
      })

      return refundOrderResponse
    } catch (error) {
      throw error
    }
  }
}
