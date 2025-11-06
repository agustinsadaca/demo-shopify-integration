import {
  B2cAuthQueryDto,
  CreateOrderDto,
  CreateOrdersHistoryDto,
  ExtendedOrderDto,
  FilterOrdersByCustomerOrderNumberDto,
  FulfillmentCheckRequestDto,
  FulfillmentCheckResponseDto,
  JwtUser,
  Order,
  OrderEditDto,
  OrderHistory,
  OrderItem,
  OrderStatusAll,
  OrgType,
  QueryOrderByCurrentStatusDto,
  QueryOrderDto,
  QueryOrderItemDto,
  QueryOrdersHistoryDto,
  ReleaseOrderDto,
  UpdateOrderDto,
  UpdateOrderItemDto,
  UpdateOrdersHistoryDto
} from '@digital-logistics-gmbh/wh1plus-common/dist'
import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'
import { PinoLogger } from 'nestjs-pino'
import { Observable, of } from 'rxjs'
import connectionAuthDummy from '../../test/dummies/common/connection-auth/connection-auth-get-one-response.dummy.json'
import orderDummy from '../../test/dummies/common/order/order-dummy.json'
import { ConnectionAuthsServiceMockFactory } from '../../test/mocks/common/auth.service.mock'
import { HttpServiceMockFactory } from '../../test/mocks/common/http.mock'
import { mainConfigs } from '../config/config'
import { ConnectionAuthsService } from '../connection-auths/connection-auths.service'
import { ConnectionAuth } from '../connection-auths/entities/connection-auth.entity'
import { HttpMiddlewareService } from '../core/http-middleware.service'
import { PaginatedResult } from '../core/interfaces/pagination-result.interface'
import { OrdersService } from './orders.service'

describe('OrdersService', () => {
  let ordersService: OrdersService
  let middlewareService: HttpMiddlewareService
  let connectionAuthsService: ConnectionAuthsService
  let jwtUser: JwtUser

  jwtUser = {
    entityId: 1,
    entityRole: OrgType.Wms,
    implementationIds: '1, 2',
  }

  const orderItem: OrderItem = {
    id: 1,
    orderId: 1,
    inventoryItemSku: 'SKU-1',
    quantity: 10,
    outboundShipmentItems: undefined,
    order: undefined,
    inventoryItem: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const orderItemListObj = {
    items: [orderItem],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 1,
      totalPages: 1,
      currentPage: 1,
    },
    links: {
      first: '/order-items/filter/?limit=10',
      previous: '',
      next: '/order-items/filter/?page=1&limit=10',
      last: '/order-items/filter/?page=1&limit=10',
    },
  }
  const order = orderDummy
  const connectionAuth: ConnectionAuth = connectionAuthDummy as any as ConnectionAuth

  const createOrderDto: CreateOrderDto = {
    customerOrderId: 'orderId123',
    implementationId: 1,
    channel: 'MTV',
    currency: 'EUR',
    total: 100,
    shippingFirstName: 'name',
    shippingLastName: 'lastname',
    shippingAddressLine1: 'street 1',
    shippingCity: 'city',
    shippingCountryCodeIso: 'DE',
    shippingEmail: 'some@email.com',
    shippingMethod: 'DHL',
    shippingZip: '9410',
    paymentMethod: 'CC',
    orderItems: [orderItem],
    addressValidationNecessary: false,
  }

  const orderHistory: OrderHistory = {
    id: 1,
    orderId: 1,
    order: undefined,
    status: OrderStatusAll.new,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const orderListObj = {
    items: [order],
    meta: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 1,
      totalPages: 1,
      currentPage: 1,
    },
    links: {
      first: '/orders/filter/?limit=10',
      previous: '',
      next: '/orders/filter/?page=1&limit=10',
      last: '/orders/filter/?page=1&limit=10',
    },
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        HttpMiddlewareService,
        { provide: ConnectionAuthsService, useFactory: ConnectionAuthsServiceMockFactory },
        { provide: HttpService, useValue: HttpServiceMockFactory },
        {
          provide: PinoLogger,
          useValue: {
            logger: {
              bindings: jest.fn().mockReturnValue({ requestCorrelationId: 'test-correlation-id' }),
            },
          },
        }
      ],
    }).compile()

    ordersService = moduleRef.get<OrdersService>(OrdersService)
    middlewareService = moduleRef.get<HttpMiddlewareService>(HttpMiddlewareService)
    connectionAuthsService = moduleRef.get<ConnectionAuthsService>(ConnectionAuthsService)
  })

  it('should filterOrders call middlewareService with provided arguments and return observable', async () => {
    const queryOrderDto = { implementationId: 1 } as QueryOrderDto

    jest.spyOn(middlewareService, 'filterOrders').mockReturnValue(of(orderListObj as any as PaginatedResult<Order>))

    const result = ordersService.filterOrders(queryOrderDto, jwtUser)
    expect.hasAssertions()

    expect(middlewareService.filterOrders).toHaveBeenCalledWith(queryOrderDto, jwtUser)
    result.subscribe((data) => {
      expect(data).toEqual(orderListObj)
    })
  })

  it('should getOrder', async () => {
    const id = 1

    jest.spyOn(middlewareService, 'getOrder').mockReturnValue(of(order as any as Order))
    const result = ordersService.getOrder(id, jwtUser)

    expect(middlewareService.getOrder).toHaveBeenCalledWith(id, jwtUser)
    expect(result).toBeInstanceOf(Observable<ExtendedOrderDto>)
  })

  it('should createOrder', async () => {
    jest.spyOn(middlewareService, 'createOrder').mockReturnValue(of(order as any as Order))
    ordersService.createOrder(createOrderDto, jwtUser)

    expect(middlewareService.createOrder).toHaveBeenCalledWith(createOrderDto, jwtUser)
  })

  it('should call getB2cOrder of httpMiddlewareService with provided arguments', async () => {
    const b2cAuthQueryDto: B2cAuthQueryDto = {
      customerOrderNumber: '1',
      implementationId: '1',
      zipCode: '1111',
    }
    jest.spyOn(middlewareService, 'getB2cOrder').mockImplementation(() => new Observable())
    const result = ordersService.getB2cOrder(b2cAuthQueryDto, jwtUser)

    expect(middlewareService.getB2cOrder).toHaveBeenCalledWith(b2cAuthQueryDto, jwtUser)
    expect(result).toBeInstanceOf(Observable)
  })

  it('should return empty array', async () => {
    const queryOrderDto: QueryOrderByCurrentStatusDto = {}

    ordersService.filterOrderByCurrentStatus(queryOrderDto, jwtUser).subscribe((orders) => {
      expect(orders).toEqual([])
    })
  })

  it('should return an ExtendedOrderDto with changeableUntil null when connectionAuth is not found', async () => {
    const id = 1

    jest.spyOn(middlewareService, 'getOrder').mockReturnValue(of(order as any as Order))
    const result = await ordersService.getOrderWithChangeableTimestamp(id, jwtUser)

    expect(middlewareService.getOrder).toHaveBeenCalledWith(id, jwtUser)
    expect(result.changeableUntil).toBeNull()
  })

  it('should return an ExtendedOrderDto with changeableUntil as null if when connectionAuth is found and change time is expired', async () => {
    const id = 1
    let orderResponse = { ...order, currentStatus: OrderStatusAll.waitingForFulfillment }

    jest.spyOn(middlewareService, 'getOrder').mockReturnValue(of(orderResponse as any as Order))
    jest.spyOn(connectionAuthsService, 'findForChangeableTimestamp').mockResolvedValue(connectionAuth)

    const result = await ordersService.getOrderWithChangeableTimestamp(id, jwtUser)

    expect(middlewareService.getOrder).toHaveBeenCalledWith(id, jwtUser)
    expect(result.changeableUntil).toBe(null)
  })

  it('should return an ExtendedOrderDto with a valid changeableUntil when connectionAuth is found and change time is not expired', async () => {
    const id = 1
    const now = new Date()
    let orderResponse = { ...order, currentStatus: OrderStatusAll.waitingForFulfillment, createdAt: now.toISOString() }

    let connectionAuthResponse = { ...connectionAuth, delayOrderReleaseInMinutes: null }
    jest.spyOn(middlewareService, 'getOrder').mockReturnValue(of(orderResponse as any as Order))
    jest.spyOn(connectionAuthsService, 'findForChangeableTimestamp').mockResolvedValue(connectionAuthResponse)

    const result = await ordersService.getOrderWithChangeableTimestamp(id, jwtUser)

    const expectedDateTime = new Date(now)
    expectedDateTime.setMinutes(expectedDateTime.getMinutes() + mainConfigs.defaultDelayOrderReleaseInMinutes)

    expect(middlewareService.getOrder).toHaveBeenCalledWith(id, jwtUser)
    expect(result.changeableUntil.toString()).toBe(expectedDateTime.toString())
  })

  it('filterOrderByCurrentStatus', async () => {
    const queryOrderByCurrentStatusDto = { implementationId: 1 } as QueryOrderByCurrentStatusDto

    jest.spyOn(middlewareService, 'filterOrderByCurrentStatus').mockReturnValue(of(orderListObj as any as PaginatedResult<Order>))
    ordersService.filterOrderByCurrentStatus(queryOrderByCurrentStatusDto, jwtUser).subscribe((orderEdited) => {
      expect(orderEdited).toBeDefined()
      expect(orderEdited).toEqual(orderListObj)
    })
  })

  it('should update an order', async () => {
    const id = 22
    const updateOrderDto: UpdateOrderDto = { implementationId: 1 }
    let orderToUpdate = orderDummy

    jest.spyOn(middlewareService, 'updateOrder').mockReturnValue(of(orderToUpdate as any as Order))

    ordersService.updateOrder(id, updateOrderDto, jwtUser).subscribe((orderUpdated) => {
      expect(orderUpdated).toBeDefined()
      expect(orderUpdated).toEqual(orderToUpdate)
    })

    expect(middlewareService.updateOrder).toHaveBeenCalledWith(id, updateOrderDto, jwtUser)
  })

  it('should call middlewareService releaseOrders with releaseOrderDto and user', async () => {
    const releaseOrderDto: ReleaseOrderDto = {
      implementationId: 1,
    }

    jest.spyOn(middlewareService, 'releaseOrders').mockReturnValue(of(undefined))
    ordersService.releaseOrders(releaseOrderDto, jwtUser)

    expect(middlewareService.releaseOrders).toHaveBeenCalledWith(releaseOrderDto, jwtUser)
  })

  it('should throw an error if middlewareService releaseOrders throws an error', async () => {
    const releaseOrderDto: ReleaseOrderDto = {
      implementationId: -1,
    }

    jest.spyOn(middlewareService, 'releaseOrders').mockImplementation(() => {
      throw new Error()
    })
    expect(async () => ordersService.releaseOrders(releaseOrderDto, jwtUser)).rejects.toThrow()
  })

  it('should call middlewareService.filterOrderHistories and return the result', async () => {
    const queryOrdersHistoryDto: QueryOrdersHistoryDto = {
      orderId: 1,
    }

    jest.spyOn(middlewareService, 'filterOrderHistories').mockImplementation(() => of([orderHistory]))
    ordersService.filterOrderHistories(queryOrdersHistoryDto, jwtUser).subscribe((orderHistoriesFiltered) => {
      expect(orderHistoriesFiltered[0]).toBeDefined()
      expect(orderHistoriesFiltered[0].orderId).toEqual(orderItem.orderId)
    })
  })

  it('should update an order item', async () => {
    const id = 1
    const updateOrderItemDto: UpdateOrderItemDto = {
      orderId: 1,
      inventoryItemSku: 'SKU-1',
      quantity: 11,
    }
    jest.spyOn(middlewareService, 'updateOrderItem').mockImplementation(() => of(orderItem))
    ordersService.updateOrderItem(id, updateOrderItemDto, jwtUser).subscribe((orderItemUpdated) => {
      expect(orderItemUpdated).toBeDefined()
      expect(orderItemUpdated.orderId).toEqual(orderItem.orderId)
    })
  })

  it('should get an orderHistory', async () => {
    const id = 1

    jest.spyOn(middlewareService, 'getOrderHistory').mockImplementation(() => of(orderHistory))
    ordersService.getOrderHistory(id, jwtUser).subscribe((orderHistoryFound) => {
      expect(orderHistoryFound).toBeDefined()
      expect(orderHistoryFound).toEqual(orderHistory)
    })
  })

  it('should fulfillmentStatusCheck ', async () => {

    const fulfillmentCheckRequestDto: FulfillmentCheckRequestDto = {
      orderIds: [1],
    }

    const fulfillmentCheckResponseDto: FulfillmentCheckResponseDto = {
      readyForFulfillment: [1],
      toBeFixed: [],
    }
    jest.spyOn(middlewareService, 'fulfillmentStatusCheck').mockImplementation(() => of(fulfillmentCheckResponseDto))
    ordersService.fulfillmentStatusCheck(fulfillmentCheckRequestDto, jwtUser).subscribe((data) => {
      expect(data).toBeDefined()
      expect(data).toEqual(fulfillmentCheckResponseDto)
    })
  })

  it('should isFulfillmentReadyAndUpdateOrder ', async () => {
    const orderEditDto = {
      total: 20,
      shippingFirstName: 'shippingFirstName',
    } as OrderEditDto

    jest.spyOn(middlewareService, 'isFulfillmentReadyAndUpdateOrder').mockReturnValue(of(order as any as Order))
    ordersService.isFulfillmentReadyAndUpdateOrder(orderEditDto, jwtUser).subscribe((data) => {
      expect(data).toBeDefined()
      expect(data).toEqual(order)
    })
  })

  it('should get an OrderItem', async () => {
    const id = 1

    jest.spyOn(middlewareService, 'getOrderItem').mockImplementation(() => of(orderItem))
    ordersService.getOrderItem(id, jwtUser).subscribe((orderItemFound) => {
      expect(orderItemFound).toBeDefined()
      expect(orderItemFound).toEqual(orderItem)
    })
  })

  it('should create an orderHistory', async () => {
    const createOrderHistoryDto: CreateOrdersHistoryDto = {
      orderId: 1,
      status: OrderStatusAll.returned,
    }
    jest.spyOn(middlewareService, 'createOrderHistory').mockImplementation(() => of(orderHistory))
    ordersService.createOrderHistory(createOrderHistoryDto, jwtUser).subscribe((createdOrderHistory) => {
      expect(createdOrderHistory).toBeDefined()
      expect(createdOrderHistory.orderId).toEqual(orderHistory.orderId)
    })
  })

  it('should bulkCreateOrderHistory', async () => {
    const createOrderHistoryDto: CreateOrdersHistoryDto = {
      orderId: 1,
      status: OrderStatusAll.returned,
    }

    jest.spyOn(middlewareService, 'bulkCreateOrderHistory').mockImplementation(() => of([orderHistory]))

    ordersService.bulkCreateOrderHistory([createOrderHistoryDto], jwtUser).subscribe((createdOrderHistory) => {
      expect(createdOrderHistory).toBeDefined()
      expect(createdOrderHistory).toEqual([orderHistory])
    })
  })

  it('should update an orderHistory', async () => {
    const id = 1

    const updateOrdersHistoryDto: UpdateOrdersHistoryDto = {
      orderId: 1,
      status: OrderStatusAll.returned,
    }

    jest.spyOn(middlewareService, 'updateOrderHistory').mockImplementation(() => of(orderHistory))
    ordersService.updateOrderHistory(id, updateOrdersHistoryDto, jwtUser).subscribe((updatedOrderHistory) => {
      expect(updatedOrderHistory).toBeDefined()
      expect(updatedOrderHistory.orderId).toEqual(orderHistory.orderId)
    })
  })

  it('should updateOrCreateOrders', async () => {
    jest.spyOn(middlewareService, 'updateOrCreateOrders').mockImplementation(() => of([createOrderDto]))
    ordersService.updateOrCreateOrders([createOrderDto], jwtUser).subscribe((createdOrders) => {
      expect(createdOrders).toBeDefined()
      expect(createdOrders).toEqual([createOrderDto])
    })
  })

  it('should filterOrderItems call middlewareService with provided arguments and return observable', async () => {
    const queryOrderItemDto = { orderId: 1 } as QueryOrderItemDto

    jest.spyOn(middlewareService, 'filterOrderItems').mockImplementation(() => of(orderItemListObj))
    const result = ordersService.filterOrderItems(queryOrderItemDto, jwtUser)

    expect(middlewareService.filterOrderItems).toHaveBeenCalledWith(queryOrderItemDto, jwtUser)

    result.subscribe((filteredOrderItems) => {
      expect(filteredOrderItems).toEqual(orderItemListObj)
    })
  })

  it('should filterExistingIds call middlewareService with provided arguments and return observable', async () => {
    const queryOrderByExistingCustomerIdsFilterDto = { customerOrderNumbers: ['1'] } as FilterOrdersByCustomerOrderNumberDto

    const filterExistingIdsDummy = [
      {
        customerOrderId: '5235106840885',
        metaInfo: {
          fulfillment_order_id: '6171942617397',
        },
        id: 1,
      },
      {
        customerOrderId: '5235106840885',
        metaInfo: {
          fulfillment_order_id: '6171942617399',
        },
        id: 2,
      },
    ]

    jest.spyOn(middlewareService, 'filterExistingIds').mockImplementation(() => of(filterExistingIdsDummy))
    const result = ordersService.filterExistingIds(queryOrderByExistingCustomerIdsFilterDto, jwtUser)

    expect(middlewareService.filterExistingIds).toHaveBeenCalledWith(queryOrderByExistingCustomerIdsFilterDto, jwtUser)

    result.subscribe((filteredExistingIds) => {
      expect(filteredExistingIds).toEqual(filterExistingIdsDummy)
    })
  })
})
