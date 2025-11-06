import {
  ActionEnum,
  EntityEnum,
  Implementation,
  MetaInfoOrder,
  Order,
  OrgType,
  OutboundShipment,
  TargetSystemEnum
} from './entities'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { of } from 'rxjs'
import { Repository } from 'typeorm'
import AssignedFulfillmentOrders from '../../../test/dummies/shopify/assigned-fulfillment-orders.json'
import FullyRequestedFulfillmentOrdersDummy from '../../../test/dummies/shopify/completed-fulfillments/assigned-fulfillment-order-1424.json'
import SplittedFulfillmentDemoShopifyOrder from '../../../test/dummies/shopify/partial-completed-order/existing-demo-shopify-orders.json'
import SplittedFulfillmentShopifyOrder from '../../../test/dummies/shopify/partial-completed-order/orderMap.json'
import SplittedFulfillmentOrdersDummy1422_1 from '../../../test/dummies/shopify/splitted-fulfillments/assigned-fulfillment-order-1422-1.json'
import SplittedFulfillmentOrdersDummy1422_2 from '../../../test/dummies/shopify/splitted-fulfillments/assigned-fulfillment-order-1422-2.json'
import SplittedFulfillmentOrdersDummy1423 from '../../../test/dummies/shopify/splitted-fulfillments/assigned-fulfillment-order-1423.json'
import SplittedFulfillmentOrdersDummy from '../../../test/dummies/shopify/splitted-fulfillments/assigned-fulfillment-orders.json'
import { ConnectionPoolServiceMockFactory } from '../../../test/mocks/common/connection-auth-pool.mock'
import { FieldMapperServiceMockFactory } from '../../../test/mocks/common/field-mapper-service.mock'
import { ImplementationServiceMockFactory } from '../../../test/mocks/common/implementation-service.mock'
import { OrderServiceMockFactory } from '../../../test/mocks/common/order-service.mock'
import { RepositoryMockFactory } from '../../../test/mocks/common/repository.mock'
import { MockType } from '../../../test/utils/mock-type'
import { ConnectionAuthsService } from '../../connection-auths/connection-auths.service'
import { ConnectionAuth } from '../../connection-auths/entities/connection-auth.entity'
import { ConnectionPoolService } from '../../connection-pool/connection-auth-pool.service'
import { TargetSync } from '../../core/entities/target-sync.entity'
import { PaginatedResult } from '../../core/interfaces/pagination-result.interface'
import { TargetSyncService } from '../../core/target-sync.service'
import { RoutedMessage } from '../../event-handlers/interfaces/routed-message.interface'
import { EventTriggerService } from '../../event-trigger/event-trigger-service'
import { FieldMapperService } from '../../field-mapper/field-mapper.service'
import { ImplementationsService } from '../../implementations/implementations.service'
import { InventoryBundlesService } from '../../inventory-bundles/inventory-bundles.service'
import { InventoryItemsService } from '../../inventory-items/inventory-items.service'
import { InventoryLevelSourceService } from '../../inventory-level-source/inventory-level-source.service'
import { OrdersService } from '../../orders/orders.service'
import { OutboundShipmentsService } from '../../outbound-shipments/outbound-shipments.service'
import { RefundOrdersService } from '../../refund-orders/refund-orders.service'
import { ReturnShipmentsService } from '../../return-shipments/return-shipments.service'
import { OrdersUtil } from '../utils/orders.util'
import { RateLimitUtil } from '../utils/rate-limit.util'
import {
  ShopifyFulfillmentOrderGraphQLDto
} from './dtos/shopify-fulfillment-order.dto'
import { ShopifyInventoryLevelGraphQlDto } from './dtos/shopify-inventory-level.dto'
import { OrderMapValues } from './dtos/shopify-order-map-dto'
import { PageInfoDto } from './dtos/shopify-page-info.dto'
import { ShopifyInventoryStates } from './enums/shopify-inventory-states-enum'
import { GraphQLShopifyService } from './graphql-shopify.service'
import { HttpShopifyService } from './http-shopify.service'
import { UpdateOpenOrdersData } from './interfaces/update-open-orders.interface'
import { MapperService } from './mapper.service'
import { GraphQLMapperService } from './shopify-graphql-mapper.service'
import { ShopifyService } from './shopify.service'

describe('ShopifyService', () => {
  const mockImplementation: Implementation = {
    id: 160,
    createdAt: new Date('2024-06-17T14:45:10.260Z'),
    updatedAt: new Date('2024-10-30T13:23:33.172Z'),
    customerId: 160,
    partnerId: 1,
    shopName: '🟩 Shopify wareh1',
    wmsName: '⬛️ Test JTL',
    implementationIdCustomer: null,
    implementationIdPartner: null,
    partnerLocationId: 1,
    customerLocationId: '70592987297',
    isActive: true,
    metaInfo: {
      generalReturnPeriod: 90994,
      shopify_location_gid: 'gid://shopify/Location/70592987297'
    },
    customer: {
      id: 160,
      createdAt: new Date('2024-06-17T14:45:09.984Z'),
      updatedAt: new Date('2024-06-17T14:45:09.984Z'),
      companyName: 'demo-shopify-test DEMO!TEST',
      nosCustomerCompanyId: 1321,
      companyAddressLine1: null,
      companyZipCode: null,
      companyCity: null,
      companyCountry: null,
      companyEmail: null,
      companyPhone: null,
      companyTaxNumber: null,
      companyTaxId: null
    },
    partner: {
      id: 1,
      createdAt: new Date('2021-08-30T11:21:11.467Z'),
      updatedAt: new Date('2021-08-30T11:21:11.467Z'),
      companyName: 'Ludwig Meyer'
    }
  } as unknown as Implementation

  let service: ShopifyService
  let mapperService: MapperService
  let shopifyGraphQLApi: GraphQLShopifyService
  let ordersService: OrdersService
  let implementationService: ImplementationsService
  let inventoryBundleService: InventoryBundlesService
  let configAuthData: ConnectionAuth = {
    implementationId: 1,
    connectionUrl: 'https://shop_owner.myshopify.com',
    authObject: { accessKey: 'access_key_hash', secretKey: 'secret_key_hash' },
    authStrategy: 'Basic Auth',
    isActive: true,
    targetSystem: TargetSystemEnum.SHOPIFY,
    targetType: OrgType.Shop,
    targetSyncs: null,
    targetTypeId: 1
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyService,
        MapperService,
        EventEmitter2,
        GraphQLMapperService,
        {
          provide: HttpShopifyService,
          useFactory: httpServiceMockFactory
        },
        {
          provide: GraphQLShopifyService,
          useFactory: shopifyGraphQLServiceMockFactory
        },
        {
          provide: TargetSyncService,
          useFactory: serviceMockFactory
        },
        {
          provide: OutboundShipmentsService,
          useFactory: serviceMockFactory
        },
        {
          provide: OrdersService,
          useFactory: OrderServiceMockFactory
        },
        {
          provide: InventoryItemsService,
          useFactory: serviceMockFactory
        },
        {
          provide: EventTriggerService,
          useFactory: serviceMockFactory
        },
        {
          provide: OrdersUtil,
          useFactory: serviceMockFactory
        },
        {
          provide: RateLimitUtil,
          useFactory: serviceMockFactory
        },
        {
          provide: FieldMapperService,
          useFactory: FieldMapperServiceMockFactory
        },
        {
          provide: RefundOrdersService,
          useFactory: serviceMockFactory
        },
        {
          provide: InventoryBundlesService,
          useFactory: serviceMockFactory
        },
        {
          provide: InventoryLevelSourceService,
          useFactory: serviceMockFactory
        },
        {
          provide: ReturnShipmentsService,
          useFactory: serviceMockFactory
        },
        {
          provide: ConnectionAuthsService,
          useFactory: serviceMockFactory
        },
        {
          provide: ImplementationsService,
          useFactory: ImplementationServiceMockFactory
        },
        {
          provide: ConnectionPoolService,
          useFactory: ConnectionPoolServiceMockFactory
        },
        {
          provide: getRepositoryToken(TargetSync),
          useFactory: targetSyncMockRepository
        },
        {
          provide: getRepositoryToken(ConnectionAuth),
          useFactory: RepositoryMockFactory
        },
        {
          provide: HttpShopifyService,
          useFactory: httpServiceMockFactory
        }

      ]
    }).compile()

    service = module.get<ShopifyService>(ShopifyService)
    shopifyGraphQLApi = module.get<GraphQLShopifyService>(GraphQLShopifyService)
    inventoryBundleService = module.get<InventoryBundlesService>(InventoryBundlesService)
    ordersService = module.get(OrdersService)
    mapperService = module.get(MapperService)
    implementationService = module.get<ImplementationsService>(ImplementationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return empty orders and null existingCustomerOrderIds when fulfillmentOrders is empty', async () => {
    const message: RoutedMessage = {
      entity: EntityEnum.order,
      action: ActionEnum.getMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {}
    }

    const fulfillmentOrders: ShopifyFulfillmentOrderGraphQLDto[] = []

    const result = await service.getShopifyOrdersByCustomerOrderIds(message, fulfillmentOrders)
    const emptyOrders = new Map<string, OrderMapValues>()
    expect(result.orders).toEqual(emptyOrders)
    expect(result.existingCustomerOrderIds).toBeNull()
  })

  it('should filter fulfillments when existingCustomerOrderIds have matching IDs', () => {
    const customerOrderIdsMap = new Map<string, { order?: any; fulfillments?: any[] }>()
    customerOrderIdsMap.set('5235106840885', {
      fulfillments: [{ legacyResourceId: '6171942617397' }, { legacyResourceId: '6175972852021' }]
    })

    const existingCustomerOrderIds = [
      {
        customerOrderId: '5235106840885',
        metaInfo: {
          fulfillment_order_id: '6171942617397'
        },
        id: 1
      }
    ]

    const user = {
      entityId: 1,
      entityRole: OrgType.Shop,
      implementationIds: '1'
    }
    service.removeExistingFulfillmentsFromMap(existingCustomerOrderIds, customerOrderIdsMap, user)

    expect(customerOrderIdsMap.get('5235106840885').fulfillments).toEqual([
      { legacyResourceId: '6175972852021' }
    ])
  })

  it('should be possible to get Orders via ShopifyApi', async () => {
    const query = {
      updated_at_min: new Date(),
      updated_at_max: new Date(),
      order: 'updated_at asc'
    }

    const message: RoutedMessage = {
      entity: EntityEnum.order,
      action: ActionEnum.getMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {}
    }

    try {
      await service.getOrders(message)
      expect(shopifyGraphQLApi.getAssignedFulfillmentOrdersList).toHaveBeenCalledWith(
        configAuthData,
        query
      )
    } catch (e) { }
  })

  it('Should Accept multiple fulfillment requests for a single shopify order', async () => {
    const message: RoutedMessage = {
      entity: EntityEnum.order,
      action: ActionEnum.getMany,
      target: OrgType.Shop,
      implementationId: 160,
      targetTypeId: 1,
      data: {}
    }

    jest.spyOn(shopifyGraphQLApi, 'getAssignedFulfillmentOrdersList').mockReturnValue(
      of({
        fulfillmentOrders:
          SplittedFulfillmentOrdersDummy.fulfillmentOrders as unknown as ShopifyFulfillmentOrderGraphQLDto[],
        pageInfo: SplittedFulfillmentOrdersDummy.pageInfo as unknown as PageInfoDto
      })
    )

    jest.spyOn(ordersService, 'filterExistingIds').mockReturnValue(
      of([
        {
          id: 45767,
          customerOrderId: '6529171718305',
          metaInfo: {
            shopify_order_gid: 'gid://shopify/Order/6529171718305',
            partial_fulfillment: true,
            fulfillment_order_id: '7683869835425',
            isShippingMethodUnknown: false,
            noAddressValidationReason: 'notActivated',
            shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683869835425'
          }
        }
      ])
    )

    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(mockImplementation))

    const finalOrders = await service.getOrders(message)

    const assignedCustomerOrderIds = finalOrders
      .filter((finalOrder) => finalOrder.customerOrderId.includes('-'))
      .map((item) => item.customerOrderId)

    expect(assignedCustomerOrderIds).toHaveLength(2)
    expect(assignedCustomerOrderIds.sort()).toEqual(['6529171718305-1', '6529180631201-1'].sort())
  })

  it('Should be able to calculate partial orders', async () => {
    const customerOrderIdsMap = new Map<string, { order?: any; fulfillments?: any[] }>()
    customerOrderIdsMap.set('6529171718305', SplittedFulfillmentShopifyOrder)
    const user = {
      entityId: 1,
      entityRole: OrgType.Shop,
      implementationIds: '1'
    }

    jest
      .spyOn(ordersService, 'filterOrders')
      .mockReturnValue(of([] as any as PaginatedResult<Order>))

    const partialOrders = await service.calculateOrdersComplete(user, {
      orders: customerOrderIdsMap,
      existingCustomerOrderIds: []
    })

    expect(partialOrders.partialFulfilmentsOrderIds).toHaveLength(1)
    expect(partialOrders.partialFulfilmentsOrderIds).toEqual(['7683870294177'])
  })

  it('Should be able to calculate complete orders', async () => {
    const customerOrderIdsMap = new Map<string, { order?: any; fulfillments?: any[] }>()
    customerOrderIdsMap.set('6529171718305', SplittedFulfillmentShopifyOrder)
    const user = {
      entityId: 1,
      entityRole: OrgType.Shop,
      implementationIds: '1'
    }
    const existingCustomerOrderIds = [
      {
        id: 45767,
        customerOrderId: '6529171718305',
        metaInfo: {
          shopify_order_gid: 'gid://shopify/Order/6529171718305',
          partial_fulfillment: true,
          fulfillment_order_id: '7683869835425',
          isShippingMethodUnknown: false,
          noAddressValidationReason: 'notActivated',
          shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683869835425'
        }
      }
    ] as unknown as { customerOrderId: string; metaInfo: MetaInfoOrder; id: number }[]

    jest
      .spyOn(ordersService, 'filterOrders')
      .mockReturnValue(of(SplittedFulfillmentDemoShopifyOrder as any as PaginatedResult<Order>))

    const partialOrders = await service.calculateOrdersComplete(user, {
      orders: customerOrderIdsMap,
      existingCustomerOrderIds: existingCustomerOrderIds
    })

    expect(partialOrders.completedFulfilmentsOrderIds).toHaveLength(1)
    expect(partialOrders.completedFulfilmentsOrderIds).toEqual(['7683870294177'])
  })

  it('should be possible to update stocks', async () => {
    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: 'sku-test',
            metaInfo: {
              shopify_inventory_item_id: '42795288035373',
              shopify_inventory_item_gid: 'gid://shopify/inventory_item/42795288035373'
            }
          },
          inventoryLevel: [{ sellable: -10 }]
        }
      }
    }

    const implementation: Implementation = {
      id: 106,
      isActive: true,
      customerId: 103,
      partnerId: 7,
      shopName: 'shopify',
      wmsName: 'wmstest',
      implementationIdCustomer: null,
      implementationIdPartner: null,
      partnerLocationId: 7,
      customerLocationId: '74124427549',
      inventoryLevelSources: [],
      orders: [],
      inventoryLevels: [],
      notification: [],
      inventoryItems: [],
      partnerLocationInventoryItems: [],
      inboundNotices: [],
      inventoryBundles: [],
      shipsWith: [],
      returnRequests: [],
      refundOrders: [],
      returnReasons: [],
      returnSteps: [],
      customer: undefined,
      partner: undefined,
      partnerLocation: undefined,
      freeReturn: undefined,
      metaInfo: {
        shopify_location_gid: 'gid_1'
      }
    }
    const productDetaiMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/42795288035373',
      quantities: [
        {
          name: ShopifyInventoryStates.AVAILABLE,
          quantity: 10
        }
      ]
    }

    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([]))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValue(of([]))

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetaiMockResponse))
    expect.assertions(2)
    await service.updateInventoryLevels(message)
    expect(shopifyGraphQLApi.getInventoryLevels).toHaveBeenCalled()
    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalled()
  })

  it('should throw an error while updating stock if product inventory level is not found', async () => {
    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: 'sku-test',
            metaInfo: {
              shopify_inventory_item_id: '42795288035373',
              shopify_inventory_item_gid: 'gid://shopify/inventory_item/42795288035373'
            }
          },
          inventoryLevel: [{ sellable: -10 }]
        }
      }
    }

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = null
    const implementation: Implementation = {
      id: 106,
      isActive: true,
      customerId: 103,
      partnerId: 7,
      shopName: 'shopify',
      wmsName: 'wmstest',
      implementationIdCustomer: null,
      implementationIdPartner: null,
      partnerLocationId: 7,
      customerLocationId: '74124427549',
      inventoryLevelSources: [],
      orders: [],
      notification: [],
      inventoryLevels: [],
      inventoryItems: [],
      partnerLocationInventoryItems: [],
      inboundNotices: [],
      inventoryBundles: [],
      shipsWith: [],
      returnRequests: [],
      refundOrders: [],
      returnReasons: [],
      returnSteps: [],
      customer: undefined,
      partner: undefined,
      partnerLocation: undefined,
      freeReturn: undefined,
      metaInfo: {
        shopify_location_gid: 'gid_1'
      }
    }

    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))
    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    expect.assertions(1)
    await service.updateInventoryLevels(message)
    expect(shopifyGraphQLApi.getInventoryLevels).toHaveBeenCalled()
  })

  it('should not call acceptFulfillment if fulfillmentOrderIds is undefined', async () => {
    const message: RoutedMessage<UpdateOpenOrdersData> = {
      entity: EntityEnum.order,
      action: ActionEnum.open,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        fulfillmentOrderIds: [],
        fulfillmentOrderGIds: [],
        customerOrderIds: []
      }
    }

    expect.assertions(1)
    jest.spyOn(shopifyGraphQLApi, 'acceptFulfillment').mockReturnValue(of(undefined))

    await service.updateOpenedOrders(message)

    expect(shopifyGraphQLApi.acceptFulfillment).not.toHaveBeenCalled()
  })

  it('should not call acceptFulfillment if there is no any fulfillmentOrderIds', async () => {
    const message: RoutedMessage<UpdateOpenOrdersData> = {
      entity: EntityEnum.order,
      action: ActionEnum.open,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        fulfillmentOrderIds: [],
        fulfillmentOrderGIds: [],
        customerOrderIds: []
      }
    }

    expect.assertions(1)
    jest.spyOn(shopifyGraphQLApi, 'acceptFulfillment').mockReturnValue(of(undefined))

    await service.updateOpenedOrders(message)

    expect(shopifyGraphQLApi.acceptFulfillment).not.toHaveBeenCalled()
  })

  it('should return response if fulfillment orders Ids are present', async () => {
    const message: RoutedMessage<UpdateOpenOrdersData> = {
      entity: EntityEnum.order,
      action: ActionEnum.open,
      target: OrgType.Shop,
      implementationId: 160,
      targetTypeId: 1,
      data: {
        fulfillmentOrderGIds: ['gid://shopify/FulfillmentOrder/7683869835425'],
        fulfillmentOrderIds: ['7683869835425'],
        customerOrderIds: []
      }
    }

    const fulfillmentOrderMockResponse = {
      id: 'gid://shopify/FulfillmentOrder/7683869835425',
      orderId: 'gid://shopify/Order/6529171718305',
      orderName: '#1109',
      status: 'OPEN',
      requestStatus: 'SUBMITTED',
      supportedActions: [
        {
          action: 'CANCEL_FULFILLMENT_ORDER'
        }
      ]
    }
    const acceptFulfillmentMockResponse = {
      id: 'gid://shopify/FulfillmentOrder/7683869835425',
      orderId: 'gid://shopify/Order/6529171718305'
    } as Pick<ShopifyFulfillmentOrderGraphQLDto, 'id' | 'orderId'>

    jest
      .spyOn(shopifyGraphQLApi, 'getFulfillmentOrder')
      .mockReturnValue(
        of(
          fulfillmentOrderMockResponse as any as Pick<
            ShopifyFulfillmentOrderGraphQLDto,
            'id' | 'orderId' | 'status' | 'requestStatus' | 'supportedActions'
          >
        )
      )
    jest
      .spyOn(shopifyGraphQLApi, 'acceptFulfillment')
      .mockReturnValue(of(acceptFulfillmentMockResponse))

    expect.assertions(1)
    await service.updateOpenedOrders(message)

    expect(shopifyGraphQLApi.acceptFulfillment).toHaveBeenCalled()
  })

  it('should create an order with the correct shipping cost with 100% discount present', async () => {
    const fulfillmentOrders = JSON.parse(
      JSON.stringify(FullyRequestedFulfillmentOrdersDummy.fulfillmentOrders)
    ) as ShopifyFulfillmentOrderGraphQLDto[]
    fulfillmentOrders[0].order.shippingLines.nodes[0].discountedPriceSet.shopMoney.amount = "0.00"
    const message: RoutedMessage = {
      entity: EntityEnum.order,
      action: ActionEnum.getMany,
      target: OrgType.Shop,
      implementationId: 160,
      targetTypeId: 1,
      data: {}
    }

    jest.spyOn(shopifyGraphQLApi, 'getAssignedFulfillmentOrdersList').mockReturnValue(
      of({
        fulfillmentOrders: fulfillmentOrders as unknown as ShopifyFulfillmentOrderGraphQLDto[],
        pageInfo: SplittedFulfillmentOrdersDummy.pageInfo as unknown as PageInfoDto
      })
    )

    jest.spyOn(ordersService, 'filterExistingIds').mockReturnValue(of([]))

    jest
      .spyOn(implementationService, 'getImplementation')
      .mockReturnValue(of(mockImplementation))

    const finalOrders = await service.getOrders(message)

    expect(finalOrders).toMatchObject([
      {
        customerOrderId: '6529126072481',
        customerOrderNumber: '1108',
        channel: 'shopify',
        currency: 'INR',
        shippingFirstName: 'Jeel',
        shippingLastName: 'Parikh',
        shippingAddressLine1: 'test',
        shippingAddressLine2: 'test',
        shippingCompanyName: null,
        shippingEmail: 'jeel@testt.com',
        shippingZip: '382424',
        shippingCity: 'Berlin',
        shippingRegion: 'Gujarat',
        shippingCountryCodeIso: 'IN',
        shippingPhone: null,
        paymentMethod: 'bogus',
        shippingMethod: '1',
        orderItems: [
          {
            orderId: null,
            inventoryItemSku: 'demo-shopify-12102020',
            pricePaid: 200,
            pricePaidNet: 200,
            taxAmount: 0,
            taxRate: 0,
            unitPrice: 100,
            unitPriceNet: 100,
            quantity: 2,
            discountRate: null,
            currency: 'INR',
            order: undefined,
            inventoryItem: undefined,
            outboundShipmentItems: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            customerLineItemId: '15835504115873',
            discount: null,
            discountNet: null,
            discountTaxAmount: null,
            discountTaxRate: 0,
            metaInfo: {
              fulfillment_order_line_item_id: '16080561078433',
              shopify_fulfillment_order_line_item_gid:
                'gid://shopify/FulfillmentOrderLineItem/16080561078433',
              shopify_order_line_item_gid: 'gid://shopify/LineItem/15835504115873'
            }
          }
        ],
        implementationId: 160,
        orderHistories: null,
        placedAt: new Date('2025-02-24T10:37:20.000Z'),
        billingFirstName: 'Jeel',
        billingLastName: 'Parikh',
        billingAddressLine1: 'test',
        billingAddressLine2: 'test',
        billingCompanyName: '',
        billingEmail: '',
        billingZip: '382424',
        billingCity: 'Berlin',
        billingRegion: 'Gujarat',
        billingCountryCodeIso: 'IN',
        billingPhone: '',
        shippingCost: 0,
        shippingCostNet: 0,
        shippingTaxAmount: null,
        shippingTaxRate: null,
        discount: 0,
        discountNet: 0,
        discountTaxAmount: 0,
        discountTaxRate: 0,
        total: 200,
        totalTaxRate: 0,
        totalTaxAmount: 0,
        totalNet: 200,
        metaInfo: {
          fulfillment_order_id: '7683821207713',
          shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683821207713',
          shopify_order_gid: 'gid://shopify/Order/6529126072481'
        }
      }
    ])

  })

  it('should create an order with the correct shipping cost without discount', async () => {
    const fulfillmentOrders =
      FullyRequestedFulfillmentOrdersDummy.fulfillmentOrders as any as ShopifyFulfillmentOrderGraphQLDto[]
    const message: RoutedMessage = {
      entity: EntityEnum.order,
      action: ActionEnum.getMany,
      target: OrgType.Shop,
      implementationId: 160,
      targetTypeId: 1,
      data: {}
    }

    jest.spyOn(shopifyGraphQLApi, 'getAssignedFulfillmentOrdersList').mockReturnValue(
      of({
        fulfillmentOrders: fulfillmentOrders as unknown as ShopifyFulfillmentOrderGraphQLDto[],
        pageInfo: SplittedFulfillmentOrdersDummy.pageInfo as unknown as PageInfoDto
      })
    )

    jest.spyOn(ordersService, 'filterExistingIds').mockReturnValue(of([]))

    jest
      .spyOn(implementationService, 'getImplementation')
      .mockReturnValue(of(mockImplementation))

    const finalOrders = await service.getOrders(message)

    expect(finalOrders).toMatchObject([
      {
        customerOrderId: '6529126072481',
        customerOrderNumber: '1108',
        channel: 'shopify',
        currency: 'INR',
        shippingFirstName: 'Jeel',
        shippingLastName: 'Parikh',
        shippingAddressLine1: 'test',
        shippingAddressLine2: 'test',
        shippingCompanyName: null,
        shippingEmail: 'jeel@testt.com',
        shippingZip: '382424',
        shippingCity: 'Berlin',
        shippingRegion: 'Gujarat',
        shippingCountryCodeIso: 'IN',
        shippingPhone: null,
        paymentMethod: 'bogus',
        shippingMethod: '1',
        orderItems: [
          {
            orderId: null,
            inventoryItemSku: 'demo-shopify-12102020',
            pricePaid: 200,
            pricePaidNet: 200,
            taxAmount: 0,
            taxRate: 0,
            unitPrice: 100,
            unitPriceNet: 100,
            quantity: 2,
            discountRate: null,
            currency: 'INR',
            order: undefined,
            inventoryItem: undefined,
            outboundShipmentItems: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            customerLineItemId: '15835504115873',
            discount: null,
            discountNet: null,
            discountTaxAmount: null,
            discountTaxRate: 0,
            metaInfo: {
              fulfillment_order_line_item_id: '16080561078433',
              shopify_fulfillment_order_line_item_gid:
                'gid://shopify/FulfillmentOrderLineItem/16080561078433',
              shopify_order_line_item_gid: 'gid://shopify/LineItem/15835504115873'
            }
          }
        ],
        implementationId: 160,
        orderHistories: null,
        placedAt: new Date('2025-02-24T10:37:20.000Z'),
        billingFirstName: 'Jeel',
        billingLastName: 'Parikh',
        billingAddressLine1: 'test',
        billingAddressLine2: 'test',
        billingCompanyName: '',
        billingEmail: '',
        billingZip: '382424',
        billingCity: 'Berlin',
        billingRegion: 'Gujarat',
        billingCountryCodeIso: 'IN',
        billingPhone: '',
        shippingCost: 110,
        shippingCostNet: 110,
        shippingTaxAmount: null,
        shippingTaxRate: null,
        discount: 0,
        discountNet: 0,
        discountTaxAmount: 0,
        discountTaxRate: 0,
        total: 310,
        totalTaxRate: 0,
        totalTaxAmount: 0,
        totalNet: 310,
        metaInfo: {
          fulfillment_order_id: '7683821207713',
          shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683821207713',
          shopify_order_gid: 'gid://shopify/Order/6529126072481'
        }
      }
    ])

  })

  describe('Shopify Order Creation', () => {
    describe('Shopify Complete Fulfillment request for an Order-C', () => {
      it('should create a correct order dto for Complete-fulfillment request of an order', async () => {
        const fulfillmentOrders =
          FullyRequestedFulfillmentOrdersDummy.fulfillmentOrders as any as ShopifyFulfillmentOrderGraphQLDto[]

        const message: RoutedMessage = {
          entity: EntityEnum.order,
          action: ActionEnum.getMany,
          target: OrgType.Shop,
          implementationId: 160,
          targetTypeId: 1,
          data: {}
        }

        jest.spyOn(shopifyGraphQLApi, 'getAssignedFulfillmentOrdersList').mockReturnValue(
          of({
            fulfillmentOrders: fulfillmentOrders as unknown as ShopifyFulfillmentOrderGraphQLDto[],
            pageInfo: SplittedFulfillmentOrdersDummy.pageInfo as unknown as PageInfoDto
          })
        )

        jest.spyOn(ordersService, 'filterExistingIds').mockReturnValue(of([]))

        jest
          .spyOn(implementationService, 'getImplementation')
          .mockReturnValue(of(mockImplementation))

        const finalOrders = await service.getOrders(message)

        expect(finalOrders).toMatchObject([
          {
            customerOrderId: '6529126072481',
            customerOrderNumber: '1108',
            channel: 'shopify',
            currency: 'INR',
            shippingFirstName: 'Jeel',
            shippingLastName: 'Parikh',
            shippingAddressLine1: 'test',
            shippingAddressLine2: 'test',
            shippingCompanyName: null,
            shippingEmail: 'jeel@testt.com',
            shippingZip: '382424',
            shippingCity: 'Berlin',
            shippingRegion: 'Gujarat',
            shippingCountryCodeIso: 'IN',
            shippingPhone: null,
            paymentMethod: 'bogus',
            shippingMethod: '1',
            orderItems: [
              {
                orderId: null,
                inventoryItemSku: 'demo-shopify-12102020',
                pricePaid: 200,
                pricePaidNet: 200,
                taxAmount: 0,
                taxRate: 0,
                unitPrice: 100,
                unitPriceNet: 100,
                quantity: 2,
                discountRate: null,
                currency: 'INR',
                order: undefined,
                inventoryItem: undefined,
                outboundShipmentItems: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                customerLineItemId: '15835504115873',
                discount: null,
                discountNet: null,
                discountTaxAmount: null,
                discountTaxRate: 0,
                metaInfo: {
                  fulfillment_order_line_item_id: '16080561078433',
                  shopify_fulfillment_order_line_item_gid:
                    'gid://shopify/FulfillmentOrderLineItem/16080561078433',
                  shopify_order_line_item_gid: 'gid://shopify/LineItem/15835504115873'
                }
              }
            ],
            implementationId: 160,
            orderHistories: null,
            placedAt: new Date('2025-02-24T10:37:20.000Z'),
            billingFirstName: 'Jeel',
            billingLastName: 'Parikh',
            billingAddressLine1: 'test',
            billingAddressLine2: 'test',
            billingCompanyName: '',
            billingEmail: '',
            billingZip: '382424',
            billingCity: 'Berlin',
            billingRegion: 'Gujarat',
            billingCountryCodeIso: 'IN',
            billingPhone: '',
            shippingCost: 110,
            shippingCostNet: 110,
            shippingTaxAmount: null,
            shippingTaxRate: null,
            discount: 0,
            discountNet: 0,
            discountTaxAmount: 0,
            discountTaxRate: 0,
            total: 310,
            totalTaxRate: 0,
            totalTaxAmount: 0,
            totalNet: 310,
            metaInfo: {
              fulfillment_order_id: '7683821207713',
              shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683821207713',
              shopify_order_gid: 'gid://shopify/Order/6529126072481'
            }
          }
        ])
      })
    })

    describe('Shopify Partial Fulfillment request for an Order-B', () => {
      it('should create a correct order dto for partial fulfillment request of an order', async () => {
        const fulfillmentOrders =
          SplittedFulfillmentOrdersDummy1423.fulfillmentOrders as any as ShopifyFulfillmentOrderGraphQLDto[]

        const message: RoutedMessage = {
          entity: EntityEnum.order,
          action: ActionEnum.getMany,
          target: OrgType.Shop,
          implementationId: 160,
          targetTypeId: 1,
          data: {}
        }

        jest.spyOn(shopifyGraphQLApi, 'getAssignedFulfillmentOrdersList').mockReturnValue(
          of({
            fulfillmentOrders: fulfillmentOrders as unknown as ShopifyFulfillmentOrderGraphQLDto[],
            pageInfo: SplittedFulfillmentOrdersDummy.pageInfo as unknown as PageInfoDto
          })
        )

        jest.spyOn(ordersService, 'filterExistingIds').mockReturnValue(of([]))

        jest
          .spyOn(implementationService, 'getImplementation')
          .mockReturnValue(of(mockImplementation))

        const finalOrders = await service.getOrders(message)

        expect(finalOrders).toMatchObject([
          {
            customerOrderId: '6529171718305',
            customerOrderNumber: '1109',
            channel: 'shopify',
            currency: 'INR',
            shippingFirstName: 'Jeel',
            shippingLastName: 'Parikh',
            shippingAddressLine1: 'test',
            shippingAddressLine2: 'test',
            shippingCompanyName: null,
            shippingEmail: 'jeel@testttt.com',
            shippingZip: '382424',
            shippingCity: 'ahmedabad',
            shippingRegion: 'Gujarat',
            shippingCountryCodeIso: 'IN',
            shippingPhone: null,
            paymentMethod: 'bogus',
            shippingMethod: '1',
            orderItems: [
              {
                orderId: null,
                inventoryItemSku: 'demo-shopify-12102020',
                pricePaid: 200,
                pricePaidNet: 200,
                taxAmount: 0,
                taxRate: 0,
                unitPrice: 100,
                unitPriceNet: 100,
                quantity: 2,
                discountRate: null,
                currency: 'INR',
                order: undefined,
                inventoryItem: undefined,
                outboundShipmentItems: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                customerLineItemId: '15835608645793',
                discount: null,
                discountNet: null,
                discountTaxAmount: null,
                discountTaxRate: 0,
                metaInfo: {
                  fulfillment_order_line_item_id: '16080666165409',
                  shopify_fulfillment_order_line_item_gid:
                    'gid://shopify/FulfillmentOrderLineItem/16080666165409',
                  shopify_order_line_item_gid: 'gid://shopify/LineItem/15835608645793'
                }
              }
            ],
            implementationId: 160,
            orderHistories: null,
            placedAt: new Date('2025-02-24T12:25:06.000Z'),
            billingFirstName: 'Jeel',
            billingLastName: 'Parikh',
            billingAddressLine1: 'test',
            billingAddressLine2: 'test',
            billingCompanyName: '',
            billingEmail: '',
            billingZip: '382424',
            billingCity: 'ahmedabad',
            billingRegion: 'Gujarat',
            billingCountryCodeIso: 'IN',
            billingPhone: '',
            shippingCost: 110,
            shippingCostNet: 110,
            shippingTaxAmount: null,
            shippingTaxRate: null,
            discount: 0,
            discountNet: 0,
            discountTaxAmount: 0,
            discountTaxRate: 0,
            total: 310,
            totalTaxRate: 0,
            totalTaxAmount: 0,
            totalNet: 310,
            metaInfo: {
              fulfillment_order_id: '7683869835425',
              shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683869835425',
              shopify_order_gid: 'gid://shopify/Order/6529171718305',
              partial_fulfillment: true
            }
          }
        ])
      })
    })

    describe('Shopify Partial Fulfillment request for an Order-A', () => {
      it('should create a correct order dto for partial fulfillment request(1st) of the order', async () => {
        const fulfillmentOrders =
          SplittedFulfillmentOrdersDummy1422_1.fulfillmentOrders as any as ShopifyFulfillmentOrderGraphQLDto[]

        const message: RoutedMessage = {
          entity: EntityEnum.order,
          action: ActionEnum.getMany,
          target: OrgType.Shop,
          implementationId: 160,
          targetTypeId: 1,
          data: {}
        }

        jest.spyOn(shopifyGraphQLApi, 'getAssignedFulfillmentOrdersList').mockReturnValue(
          of({
            fulfillmentOrders: fulfillmentOrders as unknown as ShopifyFulfillmentOrderGraphQLDto[],
            pageInfo: SplittedFulfillmentOrdersDummy.pageInfo as unknown as PageInfoDto
          })
        )

        jest.spyOn(ordersService, 'filterExistingIds').mockReturnValue(of([]))

        jest
          .spyOn(implementationService, 'getImplementation')
          .mockReturnValue(of(mockImplementation))

        const finalOrders = await service.getOrders(message)
        expect(finalOrders).toMatchObject([
          {
            customerOrderId: '6529171718305',
            customerOrderNumber: '1109',
            channel: 'shopify',
            currency: 'INR',
            shippingFirstName: 'Jeel',
            shippingLastName: 'Parikh',
            shippingAddressLine1: 'test',
            shippingAddressLine2: 'test',
            shippingCompanyName: null,
            shippingEmail: 'jeel@testttt.com',
            shippingZip: '382424',
            shippingCity: 'ahmedabad',
            shippingRegion: 'Gujarat',
            shippingCountryCodeIso: 'IN',
            shippingPhone: null,
            paymentMethod: 'bogus',
            shippingMethod: '1',
            orderItems: [
              {
                orderId: null,
                inventoryItemSku: 'demo-shopify-12102020',
                pricePaid: 200,
                pricePaidNet: 200,
                taxAmount: 0,
                taxRate: 0,
                unitPrice: 100,
                unitPriceNet: 100,
                quantity: 2,
                discountRate: null,
                currency: 'INR',
                order: undefined,
                inventoryItem: undefined,
                outboundShipmentItems: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                customerLineItemId: '15835608645793',
                discount: null,
                discountNet: null,
                discountTaxAmount: null,
                discountTaxRate: 0,
                metaInfo: {
                  fulfillment_order_line_item_id: '16080666165409',
                  shopify_fulfillment_order_line_item_gid:
                    'gid://shopify/FulfillmentOrderLineItem/16080666165409',
                  shopify_order_line_item_gid: 'gid://shopify/LineItem/15835608645793'
                }
              }
            ],
            implementationId: 160,
            orderHistories: null,
            placedAt: new Date('2025-02-24T12:25:06.000Z'),
            billingFirstName: 'Jeel',
            billingLastName: 'Parikh',
            billingAddressLine1: 'test',
            billingAddressLine2: 'test',
            billingCompanyName: '',
            billingEmail: '',
            billingZip: '382424',
            billingCity: 'ahmedabad',
            billingRegion: 'Gujarat',
            billingCountryCodeIso: 'IN',
            billingPhone: '',
            shippingCost: 110,
            shippingCostNet: 110,
            shippingTaxAmount: null,
            shippingTaxRate: null,
            discount: 0,
            discountNet: 0,
            discountTaxAmount: 0,
            discountTaxRate: 0,
            total: 310,
            totalTaxRate: 0,
            totalTaxAmount: 0,
            totalNet: 310,
            metaInfo: {
              fulfillment_order_id: '7683869835425',
              shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683869835425',
              shopify_order_gid: 'gid://shopify/Order/6529171718305',
              partial_fulfillment: true
            }
          }
        ])
      })

      it('should create a correct order dto for partial fulfillment request(2nd = last) of the order', async () => {
        const fulfillmentOrders =
          SplittedFulfillmentOrdersDummy1422_2.fulfillmentOrders as any as ShopifyFulfillmentOrderGraphQLDto[]

        const message: RoutedMessage = {
          entity: EntityEnum.order,
          action: ActionEnum.getMany,
          target: OrgType.Shop,
          implementationId: 160,
          targetTypeId: 1,
          data: {}
        }

        jest.spyOn(shopifyGraphQLApi, 'getAssignedFulfillmentOrdersList').mockReturnValue(
          of({
            fulfillmentOrders: fulfillmentOrders as unknown as ShopifyFulfillmentOrderGraphQLDto[],
            pageInfo: SplittedFulfillmentOrdersDummy.pageInfo as unknown as PageInfoDto
          })
        )

        jest.spyOn(ordersService, 'filterExistingIds').mockReturnValue(
          of([
            {
              id: 45767,
              customerOrderId: '6529171718305',
              metaInfo: {
                shopify_order_gid: 'gid://shopify/Order/6529171718305',
                partial_fulfillment: true,
                fulfillment_order_id: '7683869835425',
                isShippingMethodUnknown: false,
                noAddressValidationReason: 'notActivated',
                shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683869835425'
              }
            }
          ])
        )

        const filterOrdersResponse: PaginatedResult<Order> = {
          items: [
            {
              id: 45767,
              createdAt: '2025-02-25T12:40:29.602Z',
              updatedAt: '2025-02-25T12:40:30.027Z',
              implementationId: 160,
              customerOrderId: '6529171718305',
              partnerOrderId: null,
              channel: 'shopify',
              total: '310.000000',
              currency: 'INR',
              shippingFirstName: 'Jeel',
              shippingLastName: 'Parikh',
              shippingAddressLine1: 'test',
              shippingAddressLine2: 'test',
              shippingCompanyName: null,
              shippingEmail: 'jeel@testttt.com',
              shippingZip: '382424',
              shippingCity: 'ahmedabad',
              shippingRegion: 'Gujarat',
              shippingCountryCodeIso: 'IN',
              shippingPhone: null,
              shippingMethod: '1',
              paymentMethod: 'bogus',
              tags: null,
              placedAt: '2025-02-24T12:25:06.000Z',
              customerOrderNumber: '1109',
              totalNet: '310.000000',
              totalTaxAmount: '0.000000',
              totalTaxRate: '0.000000',
              shippingCost: '110.000000',
              shippingCostNet: '110.000000',
              shippingTaxAmount: null,
              shippingTaxRate: null,
              discount: '0.000000',
              discountNet: '0.000000',
              discountTaxAmount: '0.000000',
              discountTaxRate: '0.000000',
              billingFirstName: 'Jeel',
              billingLastName: 'Parikh',
              billingAddressLine1: 'test',
              billingAddressLine2: 'test',
              billingCompanyName: '',
              billingEmail: '',
              billingZip: '382424',
              billingCity: 'ahmedabad',
              billingRegion: 'Gujarat',
              billingCountryCodeIso: 'IN',
              billingPhone: '',
              metaInfo: {
                shopify_order_gid: 'gid://shopify/Order/6529171718305',
                partial_fulfillment: true,
                fulfillment_order_id: '7683869835425',
                isShippingMethodUnknown: false,
                noAddressValidationReason: 'notActivated',
                shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683869835425'
              },
              currentStatus: 'to-be-fixed',
              refundStatus: null,
              relatedOrderId: null,
              addressValidationNecessary: false,
              outboundShipments: [],
              orderItems: [
                {
                  id: 79996,
                  createdAt: '2025-02-25T12:40:29.602Z',
                  updatedAt: '2025-02-25T12:40:29.602Z',
                  orderId: 45767,
                  inventoryItemSku: 'demo-shopify-12102020',
                  pricePaid: '200.000000',
                  quantity: 2,
                  currency: 'INR',
                  customerLineItemId: '15835608645793',
                  unitPrice: '100.000000',
                  unitPriceNet: '100.000000',
                  pricePaidNet: '200.000000',
                  taxAmount: '0.000000',
                  taxRate: '0.000000',
                  isBundle: false,
                  belongsToBundle: false,
                  metaInfo: {
                    shopify_order_line_item_gid: 'gid://shopify/LineItem/15835608645793',
                    fulfillment_order_line_item_id: '16080666165409',
                    shopify_fulfillment_order_line_item_gid:
                      'gid://shopify/FulfillmentOrderLineItem/16080666165409'
                  },
                  discount: null,
                  discountNet: null,
                  discountTaxAmount: null,
                  discountTaxRate: '0.000000',
                  isShipsWithItem: false,
                  discountRate: null,
                  inventoryItem: {
                    id: 2574,
                    createdAt: '2024-08-15T17:36:14.166Z',
                    updatedAt: '2025-01-08T09:47:44.757Z',
                    sku: 'demo-shopify-12102020',
                    implementationId: 160,
                    customerItemId: '40193016758433',
                    partnerItemId: null,
                    dimensions: {
                      weight: 110,
                      weightUnit: 'kg'
                    },
                    name: 'shirt demo-shopify-129283',
                    wmsSyncedAt: null,
                    shopSyncedAt: '2024-12-04T09:43:43.163Z',
                    source: 'shopify',
                    barcode: '',
                    price: '100.000000',
                    harmonizedSystemCode: 220299,
                    countryCodeOfOrigin: 'FR',
                    customerItemType: null,
                    isBundle: false,
                    metaInfo: {
                      shopify_inventory_item_id: '42287620096161',
                      shopify_inventory_item_gid: 'gid://shopify/InventoryItem/42287620096161',
                      shopify_product_variant_gid: 'gid://shopify/ProductVariant/40193016758433'
                    },
                    packagingRatio: null,
                    packagingGroupSku: null,
                    notFulfillable: false,
                    noInventoryLevelUpdate: false,
                    isReady: false,
                    status: 'not-ready',
                    lowStockAt: null,
                    lowStockThreshold: null,
                    returnPeriod: 90994,
                    imagesUrl: [{}],
                    description: null,
                    isBatchRequired: null,
                    isBestBeforeRequired: null,
                    isBillOfMaterialsRequired: null,
                    isDivisibleRequired: null,
                    isSerialNumberRequired: null
                  }
                }
              ],
              returnShipment: [],
              orderHistories: [
                {
                  id: 311640,
                  createdAt: '2025-02-25T12:40:30.027Z',
                  updatedAt: '2025-02-25T12:40:30.027Z',
                  orderId: 45767,
                  status: 'to-be-fixed',
                  tags: [
                    {
                      code: 'FIX_REQUIRED',
                      value: '{"syncedToWmsInfo":["demo-shopify-12102020"],"stockInfo":{"demo-shopify-12102020":-2}}'
                    }
                  ],
                  wmsCreatedAt: null,
                  wmsUpdatedAt: null,
                  shopCreatedAt: null,
                  shopUpdatedAt: null,
                  source: null,
                  isInternalHistory: true
                }
              ]
            }
          ],
          meta: {
            totalItems: 1,
            itemCount: 1,
            itemsPerPage: 100,
            totalPages: 1,
            currentPage: 1
          },
          links: {
            first: '/orders/filter/?limit=100',
            previous: '',
            next: '',
            last: '/orders/filter/?page=1&limit=100'
          }
        } as any as PaginatedResult<Order>

        jest.spyOn(ordersService, 'filterOrders').mockReturnValue(of(filterOrdersResponse))

        jest
          .spyOn(implementationService, 'getImplementation')
          .mockReturnValue(of(mockImplementation))

        const finalOrders = await service.getOrders(message)
        expect(finalOrders).toMatchObject([
          {
            customerOrderId: '6529171718305-1',
            customerOrderNumber: '1109',
            channel: 'shopify',
            currency: 'INR',
            shippingFirstName: 'Jeel',
            shippingLastName: 'Parikh',
            shippingAddressLine1: 'test',
            shippingAddressLine2: 'test',
            shippingCompanyName: null,
            shippingEmail: 'jeel@testttt.com',
            shippingZip: '382424',
            shippingCity: 'ahmedabad',
            shippingRegion: 'Gujarat',
            shippingCountryCodeIso: 'IN',
            shippingPhone: null,
            paymentMethod: 'bogus',
            shippingMethod: '1',
            orderItems: [
              {
                orderId: null,
                inventoryItemSku: 'demo-shopify-12102020',
                pricePaid: 300,
                pricePaidNet: 300,
                taxAmount: 0,
                taxRate: 0,
                unitPrice: 100,
                unitPriceNet: 100,
                quantity: 3,
                discountRate: null,
                currency: 'INR',
                order: undefined,
                inventoryItem: undefined,
                outboundShipmentItems: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                customerLineItemId: '15835608645793',
                discount: null,
                discountNet: null,
                discountTaxAmount: null,
                discountTaxRate: 0,
                metaInfo: {
                  fulfillment_order_line_item_id: '16080666919073',
                  shopify_fulfillment_order_line_item_gid:
                    'gid://shopify/FulfillmentOrderLineItem/16080666919073',
                  shopify_order_line_item_gid: 'gid://shopify/LineItem/15835608645793'
                }
              }
            ],
            implementationId: 160,
            orderHistories: null,
            placedAt: new Date('2025-02-24T12:25:06.000Z'),
            billingFirstName: 'Jeel',
            billingLastName: 'Parikh',
            billingAddressLine1: 'test',
            billingAddressLine2: 'test',
            billingCompanyName: '',
            billingEmail: '',
            billingZip: '382424',
            billingCity: 'ahmedabad',
            billingRegion: 'Gujarat',
            billingCountryCodeIso: 'IN',
            billingPhone: '',
            shippingCost: 0,
            shippingCostNet: 0,
            shippingTaxAmount: 0,
            shippingTaxRate: 0,
            discount: 0,
            discountNet: 0,
            discountTaxAmount: 0,
            discountTaxRate: 0,
            total: 300,
            totalTaxRate: 0,
            totalTaxAmount: 0,
            totalNet: 300,
            metaInfo: {
              fulfillment_order_id: '7683870294177',
              shopify_fulfillment_order_gid: 'gid://shopify/FulfillmentOrder/7683870294177',
              shopify_order_gid: 'gid://shopify/Order/6529171718305',
              fulfillment_orders_complete: true,
              partial_fulfillment: true
            }
          }
        ])
      })

      it('should attach tracking url if outbound shipment carrier is DHL', () => {
        const data: {
          shipment: OutboundShipment
          extraParams: {
            location_id: string
            outboundShipmentItemSkuToQuantityMapping: Record<string, number>
            order: Order
          }
        } = {
          shipment: {
            id: 1,
            carrier: 'DHL',
            order: undefined,
            orderId: 1,
            trackingCode: '2342345235345',
            outboundShipmentItems: undefined,
            partnerShipmentId: '1'
          },
          extraParams: {
            location_id: '1',
            order: {
              id: 1,
              orderItems: [
                {
                  id: 1,
                  quantity: 3,
                  inventoryItemSku: 'test',
                  inventoryItemSkuImplementation: 'test_1',
                  inventoryItem: undefined,
                  order: undefined,
                  orderId: 1,
                  outboundShipmentItems: undefined
                }
              ],
              channel: 'shop',
              metaInfo: {
                fulfillment_order_id: '4234234'
              }
            } as any as Order,
            outboundShipmentItemSkuToQuantityMapping: {}
          }
        }

        const result = mapperService.mapTo(EntityEnum.outboundShipment, data)

        expect(result.tracking_info.url).toBe(
          'https://nolp.dhl.de/nextt-online-public/set_identcodes.do?idc=2342345235345'
        )
      })

      it('should not attach tracking url if outbound shipment carrier is not DHL', () => {
        const data: {
          shipment: OutboundShipment
          extraParams: {
            location_id: string
            outboundShipmentItemSkuToQuantityMapping: Record<string, number>
            order: Order
          }
        } = {
          shipment: {
            id: 1,
            carrier: 'UPS',
            order: undefined,
            orderId: 1,
            trackingCode: '2342345235345',
            outboundShipmentItems: undefined,
            partnerShipmentId: '1'
          },
          extraParams: {
            location_id: '1',
            order: {
              id: 1,
              orderItems: [
                {
                  id: 1,
                  quantity: 3,
                  inventoryItemSku: 'test',
                  inventoryItemSkuImplementation: 'test_1',
                  inventoryItem: undefined,
                  order: undefined,
                  orderId: 1,
                  outboundShipmentItems: undefined
                }
              ],
              channel: 'shop',
              metaInfo: {
                fulfillment_order_id: '4234234'
              }
            } as any as Order,
            outboundShipmentItemSkuToQuantityMapping: {}
          }
        }

        const result = mapperService.mapTo(EntityEnum.outboundShipment, data)

        expect(result.tracking_info.url).toBeNull()
      })

      /**
       * -----------------------
       *  Sync shipping method
       * -----------------------
       */
      it('should be possible to update stocks', async () => {
        const deliveryProfiles = [
          {
            profileLocationGroups: [
              {
                locationGroupZones: {
                  nodes: [
                    {
                      methodDefinitions: {
                        nodes: [
                          {
                            id: 'gid://shopify/DeliveryMethodDefinition/614411239733',
                            name: 'Standard International'
                          }
                        ]
                      }
                    },
                    {
                      methodDefinitions: {
                        nodes: [
                          {
                            id: 'gid://shopify/DeliveryMethodDefinition/614411272501',
                            name: 'Standard International'
                          }
                        ]
                      }
                    },
                    {
                      methodDefinitions: {
                        nodes: [
                          {
                            id: 'gid://shopify/DeliveryMethodDefinition/818835652917',
                            name: 'Standard International'
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          },
          {
            profileLocationGroups: [
              {
                locationGroupZones: {
                  nodes: [
                    {
                      methodDefinitions: {
                        nodes: [
                          {
                            id: 'gid://shopify/DeliveryMethodDefinition/614420840757',
                            name: 'Standard International'
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]

        jest
          .spyOn(shopifyGraphQLApi, 'getShippingMethods')
          .mockReturnValue(of(deliveryProfiles as any))

        const fieldMappers = await service.getShippingMethod({ implementationId: 105 })

        expect(fieldMappers).toHaveLength(1)
      })
    })
  })
})

const httpServiceMockFactory: () => MockType<HttpShopifyService> = jest.fn(() => ({
  getOrderList: jest.fn((entity) => entity),
  getShippingMethods: jest.fn((entity) => of({})),
  updateInventoryLevel: jest.fn((entity, object) => of({})),
  getInventoryLevels: jest.fn((entity, object) => of([])),
  getInventoryLevelsViaGraphQL: jest.fn((entity, object) => of([])),
  acceptFulfillment: jest.fn((entity, object) => of({})),
  getFulfillmentOrder: jest.fn((entity, object) => of({})),
  getManyInventoryItemsInventoryLevelsViaGraphQL: jest.fn((entity, object) => of({})),
  getAssignedFulfillmentOrdersList: jest.fn((entity, object) =>
    of({
      headers: {
        Link: '<https://oomay.myshopify.com/admin/api/2023-01/assigned_fulfillment_orders.json?limit=125&page_info=eyJkaXJlY3Rpb24iOiJwcmV2IiwibGFzdF9pZCI6NjY4NjE1ODE2MDIxOCwibGFzdF92YWx1ZSI6IjY2ODYxNTgxNjAyMTgifQ>; rel="previous"'
      },
      fulfillmentOrders: AssignedFulfillmentOrders.fulfillment_orders
    })
  )
}))

const shopifyGraphQLServiceMockFactory: () => MockType<GraphQLShopifyService> = jest.fn(() => ({
  getManyInventoryItemsInventoryLevels: jest.fn((entity, object) => of({})),
  updateInventoryLevel: jest.fn((entity, object) => of({})),
  getInventoryLevels: jest.fn((entity, object) => of([])),
  getShippingMethods: jest.fn((entity, object) => of([])),
  getAssignedFulfillmentOrdersList: jest.fn((entity, object) => of([])),
  getFulfillmentOrder: jest.fn((entity, object) => of([])),
  acceptFulfillment: jest.fn((entity, object) => of([]))
}))

const serviceMockFactory: () => MockType<TargetSyncService> = jest.fn(() => ({
  getLastSyncedAt: jest.fn((entity, object) => Promise),
  handleRateLimit: jest.fn((entity, object) => Promise.resolve()),
  getInventoryBundlesByInventoryItemSkuImplementation: jest.fn((entity, object) =>
    Promise.resolve()
  )
}))

const targetSyncMockRepository: () => MockType<Repository<TargetSync>> = jest.fn(() => ({
  findOne: jest.fn((object) => Promise)
}))
