import {
  ActionEnum,
  EntityEnum,
  EventType,
  Implementation,
  InventoryBundle,
  InventoryItem,
  InventoryLevelTypeSkuImplementation,
  OrgType
} from '../entities'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { of } from 'rxjs'
import { Repository } from 'typeorm'
import { ConnectionPoolServiceMockFactory } from '../../../../test/mocks/common/connection-auth-pool.mock'
import { FieldMapperServiceMockFactory } from '../../../../test/mocks/common/field-mapper-service.mock'
import { ImplementationServiceMockFactory } from '../../../../test/mocks/common/implementation-service.mock'
import { NotificationsServiceMockFactory } from '../../../../test/mocks/common/notifications-service.mock'
import { OrderServiceMockFactory } from '../../../../test/mocks/common/order-service.mock'
import { RepositoryMockFactory } from '../../../../test/mocks/common/repository.mock'
import { MockType } from '../../../../test/utils/mock-type'
import { ConnectionAuthsService } from '../../../connection-auths/connection-auths.service'
import { ConnectionAuth } from '../../../connection-auths/entities/connection-auth.entity'
import { ConnectionPoolService } from '../../../connection-pool/connection-auth-pool.service'
import { TargetSync } from '../../../core/entities/target-sync.entity'
import { TargetSyncService } from '../../../core/target-sync.service'
import { RoutedMessage } from '../../../event-handlers/interfaces/routed-message.interface'
import { EventTriggerService } from '../../../event-trigger/event-trigger-service'
import { FieldMapperService } from '../../../field-mapper/field-mapper.service'
import { ImplementationsService } from '../../../implementations/implementations.service'
import { InventoryBundlesService } from '../../../inventory-bundles/inventory-bundles.service'
import { InventoryItemsService } from '../../../inventory-items/inventory-items.service'
import { InventoryLevelSourceService } from '../../../inventory-level-source/inventory-level-source.service'
import { OrdersService } from '../../../orders/orders.service'
import { OutboundShipmentsService } from '../../../outbound-shipments/outbound-shipments.service'
import { RefundOrdersService } from '../../../refund-orders/refund-orders.service'
import { ReturnShipmentsService } from '../../../return-shipments/return-shipments.service'
import { OrdersUtil } from '../../utils/orders.util'
import { RateLimitUtil } from '../../utils/rate-limit.util'
import {
  ShopifyInventoryLevelGraphQlDto,
  ShopifyMultipleInventoryLevelGraphQlDto
} from '../dtos/shopify-inventory-level.dto'
import { ShopifyInventoryStates } from '../enums/shopify-inventory-states-enum'
import { GraphQLShopifyService } from '../graphql-shopify.service'
import { HttpShopifyService } from '../http-shopify.service'
import { MapperService } from '../mapper.service'
import { GraphQLMapperService } from '../shopify-graphql-mapper.service'
import { ShopifyService } from '../shopify.service'

describe('Shopify Stock Level', () => {
  let service: ShopifyService
  let shopifyGraphQLApi: GraphQLShopifyService
  let inventoryBundleService: InventoryBundlesService
  let inventoryLevelSourceService: InventoryLevelSourceService
  let implementationService: ImplementationsService

  type InventoryLevel = {
    sku: string
    shopify: {
      committed?: number
      available?: number
      onHand?: number
      damaged?: number
      qualityControl?: number
      reserved?: number
      safetyStock?: number
      unavailableCalculation?: number
    }
    wh1plus: {
      reserved?: number
      sellable?: number
      physical?: number
      manualOrders?: number
    }
  }

  const inventoryLevelsRegularItem: InventoryLevel[] = [
    {
      sku: 'C1',
      shopify: {
        committed: 2,
        damaged: 1,
        qualityControl: 1,
        reserved: 0,
        safetyStock: 0,
        unavailableCalculation: 4
      },
      wh1plus: {
        reserved: 4,
        sellable: 10,
        physical: 14,
        manualOrders: 0
      }
    },
    {
      sku: 'C2',
      shopify: {
        committed: 4,
        damaged: 1,
        qualityControl: 1,
        reserved: 1,
        safetyStock: 1,
        unavailableCalculation: 19
      },
      wh1plus: {
        reserved: 19,
        sellable: 20,
        physical: 39,
        manualOrders: 0
      }
    }
  ]
  const inventoryLevelsBundleItems: InventoryLevel[] = [
    {
      sku: 'B1',
      shopify: {
        committed: 1,
        damaged: 1,
        qualityControl: 0,
        reserved: 0,
        safetyStock: 0,
        unavailableCalculation: 7
      },
      wh1plus: {
        reserved: 7,
        sellable: 10,
        physical: 17,
        manualOrders: 0
      }
    },
    {
      sku: 'B2',
      shopify: {
        committed: 2,
        damaged: 0,
        qualityControl: 2,
        reserved: 0,
        safetyStock: 0,
        unavailableCalculation: 4
      },
      wh1plus: {
        reserved: 4,
        sellable: 10,
        physical: 14,
        manualOrders: 0
      }
    }
  ]

  const implementation: Implementation = {
    id: 1,
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
  const inventoryBundles: InventoryBundle[] = [
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: 'B1_1',
      inventoryItemSkuImplementation: 'C1_1',
      quantity: 2,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: 'B1',
        skuImplementation: 'B1_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '222'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: 'C1',
        skuImplementation: 'C1_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '111'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    },
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: 'B1_1',
      inventoryItemSkuImplementation: 'C2_1',
      quantity: 3,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: 'B1',
        skuImplementation: 'B1_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '222'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: 'C2',
        skuImplementation: 'C2_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '444'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    },
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: 'B2_1',
      inventoryItemSkuImplementation: 'C2_1',
      quantity: 6,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: 'B2',
        skuImplementation: 'B2_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '555'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: 'C2',
        skuImplementation: 'C2_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '444'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    }
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyService,
        MapperService,
        EventEmitter2,
        GraphQLMapperService,
        {
          provide: GraphQLShopifyService,
          useFactory: shopifyGraphQLServiceMockFactory
        },
        {
          provide: HttpShopifyService,
          useFactory: httpServiceMockFactory
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
          provide: InventoryBundlesService,
          useFactory: serviceMockFactory
        },
        {
          provide: InventoryLevelSourceService,
          useFactory: serviceMockFactory
        },
        {
          provide: RefundOrdersService,
          useFactory: serviceMockFactory
        },
        {
          provide: ReturnShipmentsService,
          useFactory: serviceMockFactory
        },
        {
          provide: NotificationsService,
          useFactory: NotificationsServiceMockFactory
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
    inventoryBundleService = module.get<InventoryBundlesService>(InventoryBundlesService)
    inventoryLevelSourceService = module.get<InventoryLevelSourceService>(InventoryLevelSourceService)
    shopifyGraphQLApi = module.get<GraphQLShopifyService>(GraphQLShopifyService)
    implementationService = module.get<ImplementationsService>(ImplementationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  it('should calculate commited quantities correctly for a regular item (C1) and one bundle', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem.find((item) => item.sku === 'C1'))
    )
    inventoryLevel.shopify.committed = 2
    inventoryLevel.wh1plus.physical = 14

    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B1'))
    )

    inventoryLevelBundle1.shopify.committed = 1

    const expectedTotalCommittedForC1 =
      inventoryLevel.shopify.committed +
      inventoryBundles[0].quantity * inventoryLevelBundle1.shopify.committed // 2 + 2 * 1 = 4

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/111',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles[0]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValue(of(bundleDetailsMockResponse))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: false,
            metaInfo: {
              shopify_inventory_item_id: '111',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/111'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)
    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: inventoryLevel.wh1plus.physical - expectedTotalCommittedForC1
        })
      })
    )
  })

  it('should calculate commited quantities correctly for a regular item (C2) and two bundles', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem.find((item) => item.sku === 'C2'))
    )
    inventoryLevel.shopify.committed = 4
    inventoryLevel.wh1plus.physical = 39
    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B1'))
    )
    inventoryLevelBundle1.shopify.committed = 1
    const inventoryLevelBundle2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B2'))
    )
    inventoryLevelBundle2.shopify.committed = 2

    const expectedTotalCommittedForC2 =
      inventoryLevel.shopify.committed +
      inventoryBundles[1].quantity * inventoryLevelBundle1.shopify.committed +
      inventoryBundles[2].quantity * inventoryLevelBundle2.shopify.committed // 4 + 3 * 1 + 6 * 2 = 19
    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/444',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      },
      {
        inventoryItemId: '555',
        id: 'gid://shopify/InventoryLevel/555',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle2.shopify.committed
          }
        ]
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles[1], inventoryBundles[2]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValue(of(bundleDetailsMockResponse))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: false,
            metaInfo: {
              shopify_inventory_item_id: '444',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/444'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: inventoryLevel.wh1plus.physical - expectedTotalCommittedForC2
        })
      })
    )
  })
  it('should calculate commited quantities correctly for a bundle (B1). Involved 2 bundles and 2 regular items', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B1'))
    )
    inventoryLevel.shopify.committed = 1
    inventoryLevel.wh1plus.physical = 17

    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B1'))
    )
    inventoryLevelBundle1.shopify.committed = 1
    const inventoryLevelBundle2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B2'))
    )
    inventoryLevelBundle2.shopify.committed = 2

    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem.find((item) => item.sku === 'C1'))
    )
    inventoryLevelRegularItem1.shopify.committed = 2
    inventoryLevelRegularItem1.wh1plus.physical = 50
    const inventoryLevelRegularItem2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem.find((item) => item.sku === 'C2'))
    )
    inventoryLevelRegularItem2.shopify.committed = 4
    inventoryLevelRegularItem2.wh1plus.physical = 50

    const quantityOfB1ForC1 = inventoryBundles[0].quantity
    const quantityOfB1ForC2 = inventoryBundles[1].quantity
    const quantityOfB2ForC2 = inventoryBundles[2].quantity

    const expectedCommitedForB1C1 = Math.ceil((inventoryLevelRegularItem1.shopify.committed + quantityOfB1ForC1 * inventoryLevel.shopify.committed) / quantityOfB1ForC1)//2
    const expectedCommitedForB1C2 = Math.ceil(
      (inventoryLevelRegularItem2.shopify.committed +
        quantityOfB1ForC2 * inventoryLevelBundle1.shopify.committed +
        quantityOfB2ForC2 * inventoryLevelBundle2.shopify.committed) /
      quantityOfB1ForC2
    )//7

    const expectedTotalSellableForB1 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfB1ForC1) - expectedCommitedForB1C1, Math.floor(inventoryLevelRegularItem2.wh1plus.physical / quantityOfB1ForC2) - expectedCommitedForB1C2)// Min(23,9) = 9

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/444',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/111',
        inventoryItemId: '111',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          }
        ]
      },
      {
        id: 'gid://shopify/InventoryLevel/444',
        inventoryItemId: '444',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem2.shopify.committed
          }
        ]
      }
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      },
      {
        inventoryItemId: '555',
        id: 'gid://shopify/InventoryLevel/555',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle2.shopify.committed
          }
        ]
      }
    ]

    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      },
      {
        ilsSku: `${inventoryLevelRegularItem2.sku}_1`,
        physical: inventoryLevelRegularItem2.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation')
      .mockReturnValue(of([inventoryBundles[0], inventoryBundles[1]]))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of(inventoryBundles))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(regularItemsMockResponse))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(bundleDetailsMockResponse))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '222',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/222'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: expectedTotalSellableForB1
        })
      })
    )
  })
  it('should calculate commited quantities correctly for a bundle (B2). Involved 2 bundles and 1 regular item', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B2'))
    )
    inventoryLevel.shopify.committed = 2
    inventoryLevel.wh1plus.physical = 14
    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B1'))
    )
    inventoryLevelBundle1.shopify.committed = 1
    const inventoryLevelBundle2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B2'))
    )
    inventoryLevelBundle2.shopify.committed = 2
    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem.find((item) => item.sku === 'C2'))
    )
    inventoryLevelRegularItem1.shopify.committed = 4
    inventoryLevelRegularItem1.wh1plus.physical = 50

    const quantityOfB1ForC2 = inventoryBundles[1].quantity
    const quantityOfB2ForC2 = inventoryBundles[2].quantity

    const expectedTotalCommittedForB2 = Math.max(
      Math.ceil(
        (inventoryLevelRegularItem1.shopify.committed +
          quantityOfB1ForC2 * inventoryLevelBundle1.shopify.committed +
          quantityOfB2ForC2 * inventoryLevelBundle2.shopify.committed) /
        quantityOfB2ForC2
      )
    ) // 4


    const expectedTotalSellableForB2 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfB2ForC2) - expectedTotalCommittedForB2)// Min(4) = 4

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/555',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/444',
        inventoryItemId: '444',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          }
        ]
      },
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      },
      {
        inventoryItemId: '555',
        id: 'gid://shopify/InventoryLevel/555',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle2.shopify.committed
          }
        ]
      }
    ]

    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation')
      .mockReturnValue(of([inventoryBundles[2]]))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles[1], inventoryBundles[2]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(regularItemsMockResponse))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(bundleDetailsMockResponse))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '555',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/555'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: expectedTotalSellableForB2
        })
      })
    )
  })

  it('should calculate unavailable quantities correctly a regular item (C2) and two bundles', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem.find((item) => item.sku === 'C2'))
    )
    inventoryLevel.shopify.committed = 4
    inventoryLevel.shopify.damaged = 1
    inventoryLevel.shopify.qualityControl = 1
    inventoryLevel.shopify.reserved = 1
    inventoryLevel.shopify.safetyStock = 1
    const totalUnavailableC2 =
      inventoryLevel.shopify.damaged +
      inventoryLevel.shopify.qualityControl +
      inventoryLevel.shopify.reserved +
      inventoryLevel.shopify.safetyStock
    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B1'))
    )
    inventoryLevelBundle1.shopify.committed = 1
    inventoryLevelBundle1.shopify.damaged = 1
    inventoryLevelBundle1.shopify.qualityControl = 0
    inventoryLevelBundle1.shopify.reserved = 0
    inventoryLevelBundle1.shopify.safetyStock = 0
    const totalUnavailableB1 =
      inventoryLevelBundle1.shopify.damaged +
      inventoryLevelBundle1.shopify.qualityControl +
      inventoryLevelBundle1.shopify.reserved +
      inventoryLevelBundle1.shopify.safetyStock

    const inventoryLevelBundle2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B2'))
    )
    inventoryLevelBundle2.shopify.committed = 2
    inventoryLevelBundle2.shopify.damaged = 0
    inventoryLevelBundle2.shopify.qualityControl = 2
    inventoryLevelBundle2.shopify.reserved = 0
    inventoryLevelBundle2.shopify.safetyStock = 0
    const totalUnavailableB2 =
      inventoryLevelBundle2.shopify.damaged +
      inventoryLevelBundle2.shopify.qualityControl +
      inventoryLevelBundle2.shopify.reserved +
      inventoryLevelBundle2.shopify.safetyStock

    const quantityOfB1ForC2 = inventoryBundles[1].quantity
    const quantityOfB2ForC2 = inventoryBundles[2].quantity
    const unavailableCalculation =
      totalUnavailableC2 +
      totalUnavailableB1 * quantityOfB1ForC2 +
      totalUnavailableB2 * quantityOfB2ForC2 // 19
    const expectedTotalCommittedForC2 =
      inventoryLevel.shopify.committed +
      inventoryBundles[1].quantity * inventoryLevelBundle1.shopify.committed +
      inventoryBundles[2].quantity * inventoryLevelBundle2.shopify.committed // 4 + 3 * 1 + 6 * 2 = 19

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/444',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        },
        {
          name: ShopifyInventoryStates.DAMAGED,
          quantity: inventoryLevel.shopify.damaged
        },
        {
          name: ShopifyInventoryStates.QUALITY_CONTROL,
          quantity: inventoryLevel.shopify.qualityControl
        },
        {
          name: ShopifyInventoryStates.RESERVED,
          quantity: inventoryLevel.shopify.reserved
        },
        {
          name: ShopifyInventoryStates.SAFETY_STOCK,
          quantity: inventoryLevel.shopify.safetyStock
        }
      ]
    }
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          },
          {
            name: ShopifyInventoryStates.DAMAGED,
            quantity: inventoryLevelBundle1.shopify.damaged
          },
          {
            name: ShopifyInventoryStates.QUALITY_CONTROL,
            quantity: inventoryLevelBundle1.shopify.qualityControl
          },
          {
            name: ShopifyInventoryStates.RESERVED,
            quantity: inventoryLevelBundle1.shopify.reserved
          },
          {
            name: ShopifyInventoryStates.SAFETY_STOCK,
            quantity: inventoryLevelBundle1.shopify.safetyStock
          }
        ]
      },
      {
        inventoryItemId: '555',
        id: 'gid://shopify/InventoryLevel/555',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle2.shopify.committed
          },
          {
            name: ShopifyInventoryStates.DAMAGED,
            quantity: inventoryLevelBundle2.shopify.damaged
          },
          {
            name: ShopifyInventoryStates.QUALITY_CONTROL,
            quantity: inventoryLevelBundle2.shopify.qualityControl
          },
          {
            name: ShopifyInventoryStates.RESERVED,
            quantity: inventoryLevelBundle2.shopify.reserved
          },
          {
            name: ShopifyInventoryStates.SAFETY_STOCK,
            quantity: inventoryLevelBundle2.shopify.safetyStock
          }
        ]
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles[1], inventoryBundles[2]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValue(of(bundleDetailsMockResponse))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: false,
            metaInfo: {
              shopify_inventory_item_id: '444',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/444'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity:
            inventoryLevel.wh1plus.physical - expectedTotalCommittedForC2 - unavailableCalculation
        })
      })
    )
  })

  it('should calculate unavailable quantities correctly for a bundle (B2). Involved 2 bundles and 1 regular item', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B2'))
    )
    inventoryLevel.shopify.committed = 2

    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B1'))
    )
    inventoryLevelBundle1.shopify.committed = 1
    inventoryLevelBundle1.shopify.damaged = 1
    inventoryLevelBundle1.shopify.qualityControl = 0
    inventoryLevelBundle1.shopify.reserved = 0
    inventoryLevelBundle1.shopify.safetyStock = 0
    const totalUnavailableB1 =
      inventoryLevelBundle1.shopify.damaged +
      inventoryLevelBundle1.shopify.qualityControl +
      inventoryLevelBundle1.shopify.reserved +
      inventoryLevelBundle1.shopify.safetyStock
    const inventoryLevelBundle2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems.find((item) => item.sku === 'B2'))
    )
    inventoryLevelBundle2.shopify.committed = 2
    inventoryLevelBundle2.shopify.damaged = 0
    inventoryLevelBundle2.shopify.qualityControl = 2
    inventoryLevelBundle2.shopify.reserved = 0
    inventoryLevelBundle2.shopify.safetyStock = 0
    const totalUnavailableB2 =
      inventoryLevelBundle2.shopify.damaged +
      inventoryLevelBundle2.shopify.qualityControl +
      inventoryLevelBundle2.shopify.reserved +
      inventoryLevelBundle2.shopify.safetyStock
    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem.find((item) => item.sku === 'C2'))
    )
    inventoryLevelRegularItem1.wh1plus.physical = 50
    inventoryLevelRegularItem1.shopify.committed = 4
    inventoryLevelRegularItem1.shopify.damaged = 1
    inventoryLevelRegularItem1.shopify.qualityControl = 1
    inventoryLevelRegularItem1.shopify.reserved = 1
    inventoryLevelRegularItem1.shopify.safetyStock = 1
    const totalUnavailableC2 =
      inventoryLevelRegularItem1.shopify.damaged +
      inventoryLevelRegularItem1.shopify.qualityControl +
      inventoryLevelRegularItem1.shopify.reserved +
      inventoryLevelRegularItem1.shopify.safetyStock

    const quantityOfB1ForC2 = inventoryBundles[1].quantity
    const quantityOfB2ForC2 = inventoryBundles[2].quantity

    const expectedTotalCommittedForB2 = Math.max(
      Math.ceil(
        (inventoryLevelRegularItem1.shopify.committed +
          quantityOfB1ForC2 * inventoryLevelBundle1.shopify.committed +
          quantityOfB2ForC2 * inventoryLevelBundle2.shopify.committed) /
        quantityOfB2ForC2
      )
    ) // 4

    const expectedTotalUnavailableForB2 = Math.max(
      Math.ceil(
        (totalUnavailableC2 +
          quantityOfB1ForC2 * totalUnavailableB1 +
          quantityOfB2ForC2 * totalUnavailableB2) /
        quantityOfB2ForC2
      )
    ) // 4

    const expectedTotalSellableForB2 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfB2ForC2) - expectedTotalCommittedForB2 - expectedTotalUnavailableForB2)// 0


    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/555',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/444',
        inventoryItemId: '444',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          },
          {
            name: ShopifyInventoryStates.DAMAGED,
            quantity: inventoryLevelRegularItem1.shopify.damaged
          },
          {
            name: ShopifyInventoryStates.QUALITY_CONTROL,
            quantity: inventoryLevelRegularItem1.shopify.qualityControl
          },
          {
            name: ShopifyInventoryStates.RESERVED,
            quantity: inventoryLevelRegularItem1.shopify.reserved
          },
          {
            name: ShopifyInventoryStates.SAFETY_STOCK,
            quantity: inventoryLevelRegularItem1.shopify.safetyStock
          }
        ]
      }
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          },
          {
            name: ShopifyInventoryStates.DAMAGED,
            quantity: inventoryLevelBundle1.shopify.damaged
          },
          {
            name: ShopifyInventoryStates.QUALITY_CONTROL,
            quantity: inventoryLevelBundle1.shopify.qualityControl
          },
          {
            name: ShopifyInventoryStates.RESERVED,
            quantity: inventoryLevelBundle1.shopify.reserved
          },
          {
            name: ShopifyInventoryStates.SAFETY_STOCK,
            quantity: inventoryLevelBundle1.shopify.safetyStock
          }
        ]
      },
      {
        inventoryItemId: '555',
        id: 'gid://shopify/InventoryLevel/555',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle2.shopify.committed
          },
          {
            name: ShopifyInventoryStates.DAMAGED,
            quantity: inventoryLevelBundle2.shopify.damaged
          },
          {
            name: ShopifyInventoryStates.QUALITY_CONTROL,
            quantity: inventoryLevelBundle2.shopify.qualityControl
          },
          {
            name: ShopifyInventoryStates.RESERVED,
            quantity: inventoryLevelBundle2.shopify.reserved
          },
          {
            name: ShopifyInventoryStates.SAFETY_STOCK,
            quantity: inventoryLevelBundle2.shopify.safetyStock
          }
        ]
      }
    ]
    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      }
    ]
    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation')
      .mockReturnValue(of([inventoryBundles[2]]))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles[1], inventoryBundles[2]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(regularItemsMockResponse))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(bundleDetailsMockResponse))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '555',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/555'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }


    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity:
            expectedTotalSellableForB2
        })
      })
    )
  })

  const inventoryBundles2: InventoryBundle[] = [
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: '100001490.1_1',
      inventoryItemSkuImplementation: '100001490_1',
      quantity: 2,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: '100001490.1',
        skuImplementation: '100001490.1_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '222'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: '100001490',
        skuImplementation: '100001490_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '111'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    },
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: '100001711.1_1',
      inventoryItemSkuImplementation: '100001711_1',
      quantity: 4,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: '100001711.1',
        skuImplementation: '100001711.1_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '333'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: '100001711',
        skuImplementation: '100001711_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '444'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    },
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: '100001711.2_1',
      inventoryItemSkuImplementation: '100001711_1',
      quantity: 10,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: '100001711.2',
        skuImplementation: '100001711.2_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '555'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: '100001711',
        skuImplementation: '100001711_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '444'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    }
  ]

  it('should calculate commited quantities correctly for a regular item (100001490) and one bundle', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(JSON.stringify(inventoryLevelsRegularItem[0]))
    inventoryLevel.shopify.committed = 29
    inventoryLevel.wh1plus.physical = 429
    inventoryLevel.sku = '100001490'

    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )

    inventoryLevelBundle1.shopify.committed = 69
    inventoryLevel.sku = '100001490.1'

    const expectedTotalCommittedFor100001490 =
      inventoryLevel.shopify.committed +
      inventoryBundles2[0].quantity * inventoryLevelBundle1.shopify.committed // 167

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/111',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles2[0]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValue(of(bundleDetailsMockResponse))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: false,
            metaInfo: {
              shopify_inventory_item_id: '111',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/111'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: inventoryLevel.wh1plus.physical - expectedTotalCommittedFor100001490
        })
      })
    )
  })

  it('should calculate commited quantities correctly for a bundle (100001490.1). Involved 2 bundles and 1 regular item 100001490', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(JSON.stringify(inventoryLevelsRegularItem[0]))
    inventoryLevel.shopify.committed = 69
    inventoryLevel.wh1plus.physical = 214
    inventoryLevel.sku = '100001490.1'

    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle1.shopify.committed = 69
    inventoryLevel.sku = '100001490.1'

    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem[0])
    )
    inventoryLevelRegularItem1.wh1plus.physical = 350
    inventoryLevelRegularItem1.shopify.committed = 29
    inventoryLevelRegularItem1.sku = '100001490'

    const quantityOfBundle = inventoryBundles2[0].quantity

    const expectedTotalCommittedForB1 = Math.max(
      Math.ceil(
        (inventoryLevelRegularItem1.shopify.committed +
          quantityOfBundle * inventoryLevelBundle1.shopify.committed) /
        quantityOfBundle
      )
    ) // 84

    const expectedTotalSellableForB1 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfBundle) - expectedTotalCommittedForB1)// Min(91) = 91

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/444',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/111',
        inventoryItemId: '111',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          }
        ]
      }
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      }]

    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation')
      .mockReturnValue(of([inventoryBundles2[0]]))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles2[0]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(regularItemsMockResponse))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(bundleDetailsMockResponse))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '222',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/222'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: expectedTotalSellableForB1
        })
      })
    )
  })

  it('should calculate commited quantities correctly for a regular item (100001711) and two bundles', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(JSON.stringify(inventoryLevelsRegularItem[0]))
    inventoryLevel.sku = '100001711'
    inventoryLevel.shopify.committed = 12
    inventoryLevel.wh1plus.physical = 235
    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle1.shopify.committed = 2
    inventoryLevelBundle1.sku = '100001711.1'
    const inventoryLevelBundle2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle2.shopify.committed = 0
    inventoryLevelBundle1.sku = '100001711.2'

    const quantityInventoryItemForBundle1 = inventoryBundles2[1].quantity
    const quantityInventoryItemForBundle2 = inventoryBundles2[2].quantity

    const expectedTotalCommittedForRegularItem =
      inventoryLevel.shopify.committed +
      quantityInventoryItemForBundle1 * inventoryLevelBundle1.shopify.committed +
      quantityInventoryItemForBundle2 * inventoryLevelBundle2.shopify.committed // 20
    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/444',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '333',
        id: 'gid://shopify/InventoryLevel/333',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      },
      {
        inventoryItemId: '555',
        id: 'gid://shopify/InventoryLevel/555',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle2.shopify.committed
          }
        ]
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles2[1], inventoryBundles2[2]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValue(of(bundleDetailsMockResponse))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: false,
            metaInfo: {
              shopify_inventory_item_id: '444',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/444'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: inventoryLevel.wh1plus.physical - expectedTotalCommittedForRegularItem
        })
      })
    )
  })

  it('should calculate commited quantities correctly for a bundle (100001711.1). Involved 2 bundles and 1 regular item', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(JSON.stringify(inventoryLevelsBundleItems[0]))
    inventoryLevel.shopify.committed = 2
    inventoryLevel.sku = '100001711.1'
    inventoryLevel.wh1plus.physical = 58

    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle1.shopify.committed = 2
    inventoryLevelBundle1.sku = '100001711.1'

    const inventoryLevelBundle2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle2.shopify.committed = 0
    inventoryLevelBundle2.sku = '100001711.2'

    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem[0])
    )
    inventoryLevelRegularItem1.wh1plus.physical = 50
    inventoryLevelRegularItem1.shopify.committed = 12
    inventoryLevelRegularItem1.sku = '100001711'

    const quantityOfB1ForComponent = inventoryBundles2[1].quantity
    const quantityOfB2ForComponent = inventoryBundles2[2].quantity

    const expectedTotalCommittedForB1 = Math.max(
      Math.ceil(
        (inventoryLevelRegularItem1.shopify.committed +
          quantityOfB1ForComponent * inventoryLevelBundle1.shopify.committed +
          quantityOfB2ForComponent * inventoryLevelBundle2.shopify.committed) /
        quantityOfB1ForComponent
      )
    ) // 5

    const expectedTotalSellableForB1 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfB1ForComponent) - expectedTotalCommittedForB1)// 7

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/555',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/444',
        inventoryItemId: '444',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          }
        ]
      }
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '333',
        id: 'gid://shopify/InventoryLevel/333',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      },
      {
        inventoryItemId: '555',
        id: 'gid://shopify/InventoryLevel/555',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle2.shopify.committed
          }
        ]
      }
    ]

    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation')
      .mockReturnValue(of([inventoryBundles2[1]]))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles2[1], inventoryBundles2[2]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(regularItemsMockResponse))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(bundleDetailsMockResponse))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '555',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/555'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }


    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: expectedTotalSellableForB1
        })
      })
    )
  })

  it('should calculate commited quantities correctly for a bundle (100001711.2). Involved 2 bundles and 1 regular item', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(JSON.stringify(inventoryLevelsBundleItems[0]))
    inventoryLevel.shopify.committed = 0
    inventoryLevel.sku = '100001711.2'
    inventoryLevel.wh1plus.physical = 23

    const inventoryLevelBundle1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle1.shopify.committed = 2
    inventoryLevelBundle1.sku = '100001711.1'

    const inventoryLevelBundle2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle2.shopify.committed = 0
    inventoryLevelBundle2.sku = '100001711.2'

    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsRegularItem[0])
    )
    inventoryLevelRegularItem1.wh1plus.physical = 100
    inventoryLevelRegularItem1.shopify.committed = 12
    inventoryLevelRegularItem1.sku = '100001711'

    const quantityOfB1ForComponent = inventoryBundles2[1].quantity
    const quantityOfB2ForComponent = inventoryBundles2[2].quantity

    const expectedTotalCommittedForB1 = Math.max(
      Math.ceil(
        (inventoryLevelRegularItem1.shopify.committed +
          quantityOfB1ForComponent * inventoryLevelBundle1.shopify.committed +
          quantityOfB2ForComponent * inventoryLevelBundle2.shopify.committed) /
        quantityOfB2ForComponent
      )
    ) // 2

    const expectedTotalSellableForB1 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfB2ForComponent) - expectedTotalCommittedForB1)// 8

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/555',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/444',
        inventoryItemId: '444',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          }
        ]
      }
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '333',
        id: 'gid://shopify/InventoryLevel/333',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle1.shopify.committed
          }
        ]
      },
      {
        inventoryItemId: '555',
        id: 'gid://shopify/InventoryLevel/555',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle2.shopify.committed
          }
        ]
      }
    ]

    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation')
      .mockReturnValue(of([inventoryBundles2[2]]))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([inventoryBundles2[1], inventoryBundles2[2]]))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(regularItemsMockResponse))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(bundleDetailsMockResponse))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '555',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/555'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: expectedTotalSellableForB1
        })
      })
    )
  })

  const inventoryBundles3: InventoryBundle[] = [
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: '334762_1',
      inventoryItemSkuImplementation: '33476_1',
      quantity: 1,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: '334762',
        skuImplementation: '334762_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '222'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: '33476',
        skuImplementation: '33476_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '111'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    },
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: '334762_1',
      inventoryItemSkuImplementation: 'WZ01_1',
      quantity: 1,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: '334762',
        skuImplementation: '334762_1',
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: '333'
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: 'WZ01',
        skuImplementation: 'WZ01_1',
        isBundle: false,
        metaInfo: null,
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    }
  ]

  it('should calculate commited quantities correctly for a shopify bundle (334762) a shopify component (33476) and a manual created component (WZ01)', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(JSON.stringify(inventoryLevelsBundleItems[0]))
    inventoryLevel.sku = '334762'
    inventoryLevel.shopify.committed = 1
    inventoryLevel.wh1plus.physical = 20

    const inventoryLevelBundle: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle.shopify.committed = 1

    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelRegularItem1.sku = '33476'
    inventoryLevelRegularItem1.shopify.committed = 2
    inventoryLevelRegularItem1.wh1plus.physical = 50
    const inventoryLevelRegularItem2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelRegularItem2.sku = 'WZ01'
    inventoryLevelRegularItem2.shopify.committed = 0
    inventoryLevelRegularItem2.wh1plus.physical = 50

    const quantityOfB1ForC1 = inventoryBundles3[0].quantity
    const quantityOfB1ForC2 = inventoryBundles3[1].quantity

    const expectedCommitedForB1C1 = Math.ceil(
      (inventoryLevelRegularItem1.shopify.committed +
        quantityOfB1ForC1 * inventoryLevelBundle.shopify.committed) /
      quantityOfB1ForC1
    )// Ceil((2 + 1 * 1)/1) = 3
    const expectedCommitedForB1C2 = Math.ceil(
      (inventoryLevelRegularItem2.shopify.committed +
        quantityOfB1ForC2 * inventoryLevelBundle.shopify.committed) /
      quantityOfB1ForC2
    )// ceil(0+1*1)/1 = 1

    const expectedTotalSellableForB1 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfB1ForC1) - expectedCommitedForB1C1, Math.floor(inventoryLevelRegularItem2.wh1plus.physical / quantityOfB1ForC2) - expectedCommitedForB1C2) // 47

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/222',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/111',
        inventoryItemId: '111',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          }
        ]
      }
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle.shopify.committed
          }
        ]
      }
    ]

    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      },
      {
        ilsSku: `${inventoryLevelRegularItem2.sku}_1`,
        physical: inventoryLevelRegularItem2.wh1plus.physical,
        sellable: inventoryLevel.wh1plus.sellable,
        reserved: inventoryLevel.wh1plus.reserved
      }
    ]

    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation')
      .mockReturnValue(of(inventoryBundles3))
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of(inventoryBundles3))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(regularItemsMockResponse))
    jest
      .spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels')
      .mockReturnValueOnce(of(bundleDetailsMockResponse))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '222',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/222'
            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: expectedTotalSellableForB1
        })
      })
    )
  })

  const inventoryBundles4: InventoryBundle[] = [
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: "XVTCSBUNDLE_1",
      inventoryItemSkuImplementation: "NL6TI_1",
      quantity: 1,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: "XVTCSBUNDLE",
        skuImplementation: "XVTCSBUNDLE_1",
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: "222"
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: "NL6TI",
        skuImplementation: "NL6TI_1",
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: "111"
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    },
    {
      id: 320,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementationId: 1,
      bundleSkuImplementation: "XVTCSBUNDLE_1",
      inventoryItemSkuImplementation: "PD3XV_1",
      quantity: 1,
      implementation: implementation,
      bundleInventoryItem: {
        id: 2388,
        sku: "XVTCSBUNDLE",
        skuImplementation: "XVTCSBUNDLE_1",
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: "222"
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem,
      inventoryItem: {
        id: 2388,
        sku: "PD3XV",
        skuImplementation: "PD3XV_1",
        isBundle: false,
        metaInfo: {
          shopify_inventory_item_id: "333"
        },
        implementation: implementation,
        implementationId: 1,
        returnShipmentItems: [],
        returnRequestItems: [],
        orderItems: []
      } as InventoryItem
    }
  ]

  it('should calculate commited quantities correctly for a shopify bundle (XVTCSBUNDLE) and two shopify components (33476) and (WZ01)', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevel.sku = 'XVTCSBUNDLE'
    inventoryLevel.shopify.committed = 5

    const inventoryLevelBundle: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle.shopify.committed = 5

    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelRegularItem1.sku = 'NL6TI'
    inventoryLevelRegularItem1.shopify.committed = 11
    inventoryLevelRegularItem1.wh1plus.physical = 58
    const inventoryLevelRegularItem2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelRegularItem2.sku = 'PD3XV'
    inventoryLevelRegularItem2.shopify.committed = 384
    inventoryLevelRegularItem2.wh1plus.physical = 393

    const quantityOfB1ForC1 = inventoryBundles4[0].quantity
    const quantityOfB1ForC2 = inventoryBundles4[1].quantity

    const expectedCommitedForB1C1 = Math.ceil((inventoryLevelRegularItem1.shopify.committed + quantityOfB1ForC1 * inventoryLevelBundle.shopify.committed) / quantityOfB1ForC1)
    const expectedCommitedForB1C2 = Math.ceil((inventoryLevelRegularItem2.shopify.committed + quantityOfB1ForC2 * inventoryLevelBundle.shopify.committed) / quantityOfB1ForC2)

    const expectedTotalSellableForB1 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfB1ForC1) - expectedCommitedForB1C1, Math.floor(inventoryLevelRegularItem2.wh1plus.physical / quantityOfB1ForC2) - expectedCommitedForB1C2) // Min(42,4) = 4

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/222',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/111',
        inventoryItemId: '111',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          }
        ]
      },
      {
        id: 'gid://shopify/InventoryLevel/333',
        inventoryItemId: '333',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem2.shopify.committed
          }
        ]
      }
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle.shopify.committed
          }
        ]
      }
    ]

    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevelRegularItem1.wh1plus.sellable,
        reserved: inventoryLevelRegularItem1.wh1plus.reserved
      },
      {
        ilsSku: `${inventoryLevelRegularItem2.sku}_1`,
        physical: inventoryLevelRegularItem2.wh1plus.physical,
        sellable: inventoryLevelRegularItem2.wh1plus.sellable,
        reserved: inventoryLevelRegularItem2.wh1plus.reserved
      }
    ]

    jest.spyOn(shopifyGraphQLApi, 'getInventoryLevels').mockReturnValue(of(productDetailMockResponse))
    jest.spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation').mockReturnValue(of(inventoryBundles4))
    jest.spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation').mockReturnValue(of(inventoryBundles4))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValueOnce(of(regularItemsMockResponse))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValueOnce(of(bundleDetailsMockResponse))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '222',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/222'

            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: expectedTotalSellableForB1
        })
      })
    )
  })
  it('should calculate commited quantities correctly for a shopify bundle (XVTCSBUNDLE) and two shopify components (33476) and (WZ01) with multiple bundle quantity', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevel.sku = 'XVTCSBUNDLE'
    inventoryLevel.shopify.committed = 5

    const inventoryLevelBundle: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelBundle.shopify.committed = 5

    const inventoryLevelRegularItem1: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelRegularItem1.sku = 'NL6TI'
    inventoryLevelRegularItem1.shopify.committed = 11
    inventoryLevelRegularItem1.wh1plus.physical = 58
    const inventoryLevelRegularItem2: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevelsBundleItems[0])
    )
    inventoryLevelRegularItem2.sku = 'PD3XV'
    inventoryLevelRegularItem2.shopify.committed = 384
    inventoryLevelRegularItem2.wh1plus.physical = 410

    const inventoryBundles = JSON.parse(JSON.stringify(inventoryBundles4))
    inventoryBundles[0].quantity = 2
    inventoryBundles[1].quantity = 4

    const quantityOfB1ForC1 = inventoryBundles[0].quantity
    const quantityOfB1ForC2 = inventoryBundles[1].quantity

    const expectedCommitedForB1C1 = Math.ceil((inventoryLevelRegularItem1.shopify.committed + quantityOfB1ForC1 * inventoryLevelBundle.shopify.committed) / quantityOfB1ForC1)//(11+2*5)/2 = 11
    const expectedCommitedForB1C2 = Math.ceil((inventoryLevelRegularItem2.shopify.committed + quantityOfB1ForC2 * inventoryLevelBundle.shopify.committed) / quantityOfB1ForC2)//(384+4*5)/4 = 101
    const expectedTotalSellableForB1 = Math.min(Math.floor(inventoryLevelRegularItem1.wh1plus.physical / quantityOfB1ForC1) - expectedCommitedForB1C1, Math.floor(inventoryLevelRegularItem2.wh1plus.physical / quantityOfB1ForC2) - expectedCommitedForB1C2) //  Min(18,1) = 1

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/222',
      quantities: [
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        }
      ]
    }

    const regularItemsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        id: 'gid://shopify/InventoryLevel/111',
        inventoryItemId: '111',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem1.shopify.committed
          }
        ]
      },
      {
        id: 'gid://shopify/InventoryLevel/333',
        inventoryItemId: '333',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelRegularItem2.shopify.committed
          }
        ]
      }
    ]
    const bundleDetailsMockResponse: ShopifyMultipleInventoryLevelGraphQlDto[] = [
      {
        inventoryItemId: '222',
        id: 'gid://shopify/InventoryLevel/222',
        quantities: [
          {
            name: ShopifyInventoryStates.COMMITTED,
            quantity: inventoryLevelBundle.shopify.committed
          }
        ]
      }
    ]

    const physicalWh1Quantity: InventoryLevelTypeSkuImplementation[] = [
      {
        ilsSku: `${inventoryLevelRegularItem1.sku}_1`,
        physical: inventoryLevelRegularItem1.wh1plus.physical,
        sellable: inventoryLevelRegularItem1.wh1plus.sellable,
        reserved: inventoryLevelRegularItem1.wh1plus.reserved
      },
      {
        ilsSku: `${inventoryLevelRegularItem2.sku}_1`,
        physical: inventoryLevelRegularItem2.wh1plus.physical,
        sellable: inventoryLevelRegularItem2.wh1plus.sellable,
        reserved: inventoryLevelRegularItem2.wh1plus.reserved
      }
    ]

    jest.spyOn(shopifyGraphQLApi, 'getInventoryLevels').mockReturnValue(of(productDetailMockResponse))
    jest.spyOn(inventoryBundleService, 'getInventoryBundlesByBundleSkuImplementation').mockReturnValue(of(inventoryBundles))
    jest.spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation').mockReturnValue(of(inventoryBundles))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValueOnce(of(regularItemsMockResponse))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValueOnce(of(bundleDetailsMockResponse))
    jest.spyOn(inventoryLevelSourceService, 'getInventoryLevelQuantitiesBySkuImplementations').mockReturnValue(of(physicalWh1Quantity))

    const message: RoutedMessage = {
      entity: EntityEnum.inventoryItem,
      action: ActionEnum.updateMany,
      target: OrgType.Shop,
      implementationId: 1,
      targetTypeId: 1,
      data: {
        inventoryLevelSource: {
          inventoryItem: {
            sku: inventoryLevel.sku,
            skuImplementation: `${inventoryLevel.sku}_1`,
            isBundle: true,
            metaInfo: {
              shopify_inventory_item_id: '222',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/222'

            }
          },
          inventoryLevel: [
            {
              physical: inventoryLevel.wh1plus.physical,
              sellable: inventoryLevel.wh1plus.sellable,
              reserved: inventoryLevel.wh1plus.reserved
            }
          ],
          manualNotConfirmedOrdersQty: inventoryLevel.wh1plus.manualOrders,
          eventType: EventType.correction
        }
      }
    }

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: expectedTotalSellableForB1
        })
      })
    )
  })
})


const httpServiceMockFactory: () => MockType<HttpShopifyService> = jest.fn(() => ({
  updateInventoryLevel: jest.fn((entity, object) => of({})),
  getInventoryLevelsViaGraphQL: jest.fn((entity, object) => of([])),
  getManyInventoryItemsInventoryLevelsViaGraphQL: jest.fn((entity, object) => of([]))
}))

const shopifyGraphQLServiceMockFactory: () => MockType<GraphQLShopifyService> = jest.fn(() => ({
  updateInventoryLevel: jest.fn((entity, object) => of({})),
  getInventoryLevels: jest.fn((entity, object) => of([])),
  getManyInventoryItemsInventoryLevels: jest.fn((entity, object) => of([]))
}))

const serviceMockFactory: () => MockType<TargetSyncService> = jest.fn(() => ({
  getLastSyncedAt: jest.fn((entity, object) => Promise),
  handleRateLimit: jest.fn((entity, object) => Promise.resolve()),
  getInventoryBundlesByInventoryItemSkuImplementation: jest.fn((entity, object) =>
    Promise.resolve()
  ),
  getInventoryBundlesByBundleSkuImplementation: jest.fn((entity, object) => Promise.resolve()),
  getInventoryLevelQuantitiesBySkuImplementations: jest.fn((entity, object) => Promise.resolve())
}))

const targetSyncMockRepository: () => MockType<Repository<TargetSync>> = jest.fn(() => ({
  findOne: jest.fn((object) => Promise)
}))
