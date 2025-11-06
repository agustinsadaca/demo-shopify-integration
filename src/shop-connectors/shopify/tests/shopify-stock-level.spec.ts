import {
  ActionEnum,
  EntityEnum,
  EventType,
  Implementation,
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
import { OrderServiceMockFactory } from '../../../../test/mocks/common/order-service.mock'
import { RepositoryMockFactory } from '../../../../test/mocks/common/repository.mock'
import { MockType } from '../../../../test/utils/mock-type'
import { ConnectionAuthsService } from '../../../connection-auths/connection-auths.service'
import { ConnectionAuth } from '../../../connection-auths/entities/connection-auth.entity'
import { ConnectionPoolService } from '../../../connection-pool/connection-auth-pool.service'
import { TargetSync } from '../../../core/entities/target-sync.entity'
import { TargetSyncService } from '../../../core/target-sync.service'
import { EmailSummaryTrackService } from '../../../email-summary/email-summary-track.service'
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
import { ShopifyInventoryLevelGraphQlDto } from '../dtos/shopify-inventory-level.dto'
import { ShopifyInventoryStates } from '../enums/shopify-inventory-states-enum'
import { GraphQLShopifyService } from '../graphql-shopify.service'
import { HttpShopifyService } from '../http-shopify.service'
import { MapperService } from '../mapper.service'
import { GraphQLMapperService } from '../shopify-graphql-mapper.service'
import { ShopifyService } from '../shopify.service'

describe('Shopify Stock Level', () => {
  let service: ShopifyService
  let shopifyGraphQLApi: GraphQLShopifyService
  let implementationService: ImplementationsService
  let inventoryBundleService: InventoryBundlesService

  type InventoryLevel = {
    sku: string
    shopify: {
      committed: number
      available: number
      onHand: number
    }
    wh1plus: {
      reserved: number
      sellable: number
      physical: number
      manualOrders: number
    }
    wms: {
      physical: number
    }
  }

  const inventoryLevels: InventoryLevel[] = [
    {
      sku: 'SKU001',
      shopify: {
        committed: 0,
        available: 100,
        onHand: 100
      },
      wh1plus: {
        reserved: 0,
        sellable: 100,
        physical: 100,
        manualOrders: 0
      },
      wms: {
        physical: 100
      }
    }
  ]

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
          provide: InventoryBundlesService,
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
          provide: InventoryLevelSourceService,
          useFactory: serviceMockFactory
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
          provide: ReturnShipmentsService,
          useFactory: serviceMockFactory
        },
        {
          provide: EmailSummaryTrackService,
          useValue: {}
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
    implementationService = module.get<ImplementationsService>(ImplementationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should not oversell in the case of correction event before fulfillment request', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevels.find((item) => item.sku === 'SKU001'))
    )

    /*---- order created at shopify of SKU: SKU001 with quantity 10 ----*/
    const orderQuantity = 10
    inventoryLevel.shopify.available -= orderQuantity
    inventoryLevel.shopify.committed += orderQuantity

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/42795288035373',
      quantities: [
        {
          name: ShopifyInventoryStates.AVAILABLE,
          quantity: inventoryLevel.shopify.available
        },
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        },
        {
          name: ShopifyInventoryStates.ON_HAND,
          quantity: inventoryLevel.shopify.onHand
        }
      ]
    }
    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))

    /*---- Correction Event ----*/
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
            metaInfo: {
              shopify_inventory_item_id: '42795288035373',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/42795288035373'
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
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([]))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValue(of([]))
    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({ quantity: inventoryLevel.shopify.available })
      })
    )
  })

  it('should update stock correctly on correction event', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevels.find((item) => item.sku === 'SKU001'))
    )

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/42795288035373',
      quantities: [
        {
          name: ShopifyInventoryStates.AVAILABLE,
          quantity: inventoryLevel.shopify.available
        },
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        },
        {
          name: ShopifyInventoryStates.ON_HAND,
          quantity: inventoryLevel.shopify.onHand
        }
      ]
    }
    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))

    /*---- Correction Event ----*/
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
            metaInfo: {
              shopify_inventory_item_id: '42795288035373',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/42795288035373'
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
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([]))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValue(of([]))

    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({ quantity: inventoryLevel.shopify.available })
      })
    )
  })

  it('should not undersell in the case of correction event after fulfillment request', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevels.find((item) => item.sku === 'SKU001'))
    )

    /*---- order created at shopify of SKU: SKU001 with quantity 10 ----*/
    const orderQuantity = 10
    inventoryLevel.shopify.available -= orderQuantity
    inventoryLevel.shopify.committed += orderQuantity

    /*---- FF requested of order with SKU: SKU001 with quantity 10 ----*/
    /*---- order created at own app side of SKU: SKU001 with quantity 10 ----*/
    inventoryLevel.wh1plus.reserved += orderQuantity
    inventoryLevel.wh1plus.sellable -= orderQuantity

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/42795288035373',
      quantities: [
        {
          name: ShopifyInventoryStates.AVAILABLE,
          quantity: inventoryLevel.shopify.available
        },
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        },
        {
          name: ShopifyInventoryStates.ON_HAND,
          quantity: inventoryLevel.shopify.onHand
        }
      ]
    }
    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))

    /*---- Correction Event ----*/
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
            metaInfo: {
              shopify_inventory_item_id: '42795288035373',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/42795288035373'
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
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([]))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValue(of([]))
    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({ quantity: inventoryLevel.shopify.available })
      })
    )
  })

  it('should not undersell or oversell in the case of correction and own app has manual orders', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevels.find((item) => item.sku === 'SKU001'))
    )

    /*---- order created at shopify of SKU: SKU001 with quantity 10 ----*/
    const orderQuantity = 10
    inventoryLevel.shopify.available -= orderQuantity
    inventoryLevel.shopify.committed += orderQuantity

    /*---- FF requested of order with SKU: SKU001 with quantity 10 ----*/
    /*---- order created at own app of SKU: SKU001 with quantity 10 ----*/
    inventoryLevel.wh1plus.reserved += orderQuantity
    inventoryLevel.wh1plus.sellable -= orderQuantity

    /*---- manual order created at own app of SKU: SKU001 with quantity 15 ----*/
    const manualOrderQuantity = 15
    inventoryLevel.wh1plus.reserved += manualOrderQuantity
    inventoryLevel.wh1plus.sellable -= manualOrderQuantity
    inventoryLevel.wh1plus.manualOrders += manualOrderQuantity

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/42795288035373',
      quantities: [
        {
          name: ShopifyInventoryStates.AVAILABLE,
          quantity: inventoryLevel.shopify.available
        },
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        },
        {
          name: ShopifyInventoryStates.ON_HAND,
          quantity: inventoryLevel.shopify.onHand
        }
      ]
    }
    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))

    /*---- Correction Event ----*/
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
            metaInfo: {
              shopify_inventory_item_id: '42795288035373',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/42795288035373'
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
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([]))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValue(of([]))
    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: inventoryLevel.shopify.available - manualOrderQuantity
        })
      })
    )
  })

  it('should update stock level in case of inbound receipt event', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevels.find((item) => item.sku === 'SKU001'))
    )

    /*---- Inbound for SKU: SKU001 with quantity 100 ----*/
    const inboundQuantity = 100
    inventoryLevel.wms.physical += inboundQuantity

    inventoryLevel.wh1plus.physical += inboundQuantity
    inventoryLevel.wh1plus.sellable += inboundQuantity

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/42795288035373',
      quantities: [
        {
          name: ShopifyInventoryStates.AVAILABLE,
          quantity: inventoryLevel.shopify.available
        },
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        },
        {
          name: ShopifyInventoryStates.ON_HAND,
          quantity: inventoryLevel.shopify.onHand
        }
      ]
    }
    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))

    /*---- Inbound Receipt Event ----*/
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
            metaInfo: {
              shopify_inventory_item_id: '42795288035373',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/42795288035373'
            }
          },
          inventoryLevel: [
            {
              physical: 0,
              sellable: inboundQuantity,
              reserved: 0
            }
          ],
          eventType: EventType.inboundReceipt
        }
      }
    }
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([]))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValue(of([]))
    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: inventoryLevel.shopify.available + inboundQuantity
        })
      })
    )
  })

  it('should update stock level in case of order return shipment', async () => {
    jest.spyOn(implementationService, 'getImplementation').mockReturnValue(of(implementation))

    const inventoryLevel: InventoryLevel = JSON.parse(
      JSON.stringify(inventoryLevels.find((item) => item.sku === 'SKU001'))
    )

    /*---- return shipment of SKU: SKU001 with quantity 10 ----*/
    const returnShipmentQuantity = 10
    inventoryLevel.wms.physical += returnShipmentQuantity

    inventoryLevel.wh1plus.physical += returnShipmentQuantity
    inventoryLevel.wh1plus.sellable += returnShipmentQuantity

    const productDetailMockResponse: ShopifyInventoryLevelGraphQlDto = {
      id: 'gid://shopify/InventoryLevel/42795288035373',
      quantities: [
        {
          name: ShopifyInventoryStates.AVAILABLE,
          quantity: inventoryLevel.shopify.available
        },
        {
          name: ShopifyInventoryStates.COMMITTED,
          quantity: inventoryLevel.shopify.committed
        },
        {
          name: ShopifyInventoryStates.ON_HAND,
          quantity: inventoryLevel.shopify.onHand
        }
      ]
    }
    jest
      .spyOn(shopifyGraphQLApi, 'getInventoryLevels')
      .mockReturnValue(of(productDetailMockResponse))

    /*---- Return Shipment Event ----*/
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
            metaInfo: {
              shopify_inventory_item_id: '42795288035373',
              shopify_inventory_item_gid: 'gid://shopify/InventoryItem/42795288035373'
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
          eventType: EventType.returnShipment
        }
      }
    }
    jest
      .spyOn(inventoryBundleService, 'getInventoryBundlesByInventoryItemSkuImplementation')
      .mockReturnValue(of([]))
    jest.spyOn(shopifyGraphQLApi, 'getManyInventoryItemsInventoryLevels').mockReturnValue(of([]))
    await service.updateInventoryLevels(message)

    expect(shopifyGraphQLApi.updateInventoryLevel).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        query: expect.objectContaining({
          quantity: inventoryLevel.shopify.available + returnShipmentQuantity
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
  )
}))

const targetSyncMockRepository: () => MockType<Repository<TargetSync>> = jest.fn(() => ({
  findOne: jest.fn((object) => Promise)
}))
