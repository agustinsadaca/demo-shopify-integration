import { ActionEnum, CreateInventoryLevelSourceDto, CreateReturnStepsDto, EntityEnum, EventType, Implementation, InventoryItem, InventoryLevelSource, InventoryType, JwtUser, OrgType, QueryInventoryLevelSourceDto, QueryReturnStepsDto, UpdateReturnStepsDto } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { IPaginationOptions } from '@digital-logistics-gmbh/wh1plus-paginate'
import { HttpException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { announcementTargetServiceMockFactory } from '../../test/mocks/common/announcement-target.service.mock'
import { announcementServiceMockFactory } from '../../test/mocks/common/announcement.service.mock'
import { BrandLabelServiceMockFactory } from '../../test/mocks/common/brand-label.service.mock'
import { questionnaireTargetServiceMockFactory } from '../../test/mocks/common/questionnaire-target.service.mock'
import { questionnaireServiceMockFactory } from '../../test/mocks/common/questionnaire.service.mock'
import { ReportsServiceMockFactory } from '../../test/mocks/common/reports-service.mock'
import { AddressValidationTrackerService } from '../address-validation-tracker/address-validation-tracker.service'
import { AnnouncementTargetService } from '../announcement-target/announcement-target.service'
import { AnnouncementsService } from '../announcements/announcements.service'
import { AutomationService } from '../automation/automation.service'
import { CreateAutomationDto } from '../automation/dto/create-automation.dto'
import { QueryAutomationDto } from '../automation/dto/query-automation.dto'
import { UpdateAutomationDto } from '../automation/dto/update-automation.dto'
import { AutomationRule } from '../automation/entities/automation-rule.entity'
import { AutomationName } from '../automation/enums/automation-name.enum'
import { BrandLabelService } from '../brand-label/brand-label.service'
import { mainConfigs } from '../config/config'
import { ConnectionAuthsService } from '../connection-auths/connection-auths.service'
import { EmailSummaryService } from '../email-summary/email-summary.service'
import { EventTriggerService } from '../event-trigger/event-trigger-service'
import { FieldMapperService } from '../field-mapper/field-mapper.service'
import { FileHandlersService } from '../file-handlers/file-handlers.service'
import { InventoryLevelSourceService } from '../inventory-level-source/inventory-level-source.service'
import { QuestionnaireTargetService } from '../questionnaire-targets/questionnaire-target.service'
import { QuestionnaireService } from '../questionnaire/questionnaire.service'
import { ReportGeneratorService } from '../report-generator/report-generator.service'
import { ReportsService } from '../reports/reports.service'
import { SyncPreferencesService } from '../sync-preferences/sync-preferences.service'
import { TicketsService } from '../tickets/tickets.service'
import { ShopController } from './shop.controller'
import { ShopService } from './shop.service'

describe('ShopController', () => {
  let controller: ShopController
  const mockService = {
    testConnection: jest.fn((entity, req) => entity),

    filterImplementations: jest.fn((entity, req) => [entity]),
    getImplementation: jest.fn((entity, req) => entity),

    filterPartnerLocations: jest.fn((entity, req) => [entity]),
    getPartnerLocation: jest.fn((entity, req) => entity),

    filterOrders: jest.fn((entity, req) => [entity]),
    getOrder: jest.fn((entity, req) => entity),
    createOrder: jest.fn((entity, req) => entity),
    updateOrder: jest.fn((id, entity, req) => ({ affected: 1 })),

    filterOrderHistories: jest.fn((entity, req) => [entity]),
    getOrderHistory: jest.fn((entity, req) => entity),
    createOrderHistory: jest.fn((entity, req) => entity),
    updateOrderHistory: jest.fn((id, entity, req) => ({ affected: 1 })),

    filterOrderItems: jest.fn((entity, req) => [entity]),
    getOrderItem: jest.fn((entity, req) => entity),
    updateOrderItem: jest.fn((id, entity, req) => ({ affected: 1 })),

    filterOutboundShipments: jest.fn((entity, req) => [entity]),
    getOutboundShipment: jest.fn((entity, req) => entity),

    filterReturnShipments: jest.fn((entity, req) => [entity]),
    getReturnShipment: jest.fn((entity, req) => entity),

    filterInventoryItems: jest.fn((entity, req) => [entity]),
    getInventoryItem: jest.fn((entity, req) => entity),
    createInventoryItem: jest.fn((entity, req) => entity),
    updateInventoryItem: jest.fn((id, entity, req) => ({ affected: 1 })),

    filterPartnerLocationInventoryItems: jest.fn((entity, req) => [entity]),
    getPartnerLocationInventoryItem: jest.fn((entity, req) => entity),

    createEventTrigger: jest.fn((entity, req) => entity),
    consumeEventTrigger: jest.fn((entity, req) => entity),
    fileRoute: jest.fn((entity, req) => entity),

    filterNotifications: jest.fn((entity, req) => [entity]),
    getNotification: jest.fn((entity, req) => entity),
    updateNotification: jest.fn((id, entity, req) => ({ affected: 1 })),

    filterInventoryLevelSourceItems: jest.fn((entity, req) => [entity]),
    getInventoryLevelSourceItem: jest.fn((entity, req) => entity),

    filterReturnSteps: jest.fn((entity, req) => [entity]),
    getReturnStep: jest.fn((entity, req) => entity),
    createReturnStep: jest.fn((entity, req) => entity),
    updateReturnStep: jest.fn((id, entity, req) => ({ affected: 1 })),
  }

  let mockFieldMapperService = {
    findByFilter: jest.fn((entity, req) => [entity]),
    findOne: jest.fn((entity, req) => entity),
    create: jest.fn((entity, req) => entity),
    update: jest.fn((id, entity, req) => ({ affected: 1 })),
    delete: jest.fn((id, req) => ({ affected: 1 })),
  }

  const automationMockService = {
    create: jest.fn(entity => entity),
    findByFilter: jest.fn((entity, option) => [entity]),
    findOne: jest.fn(entity => entity),
    update: jest.fn(),
    remove: jest.fn()
  }

  const inventoryLevelSourceMockService = {
    findByFilter: jest.fn((entity, option) => [entity]),
    findOne: jest.fn(entity => entity)
  }

  const connectionAuthsServiceMockService = {
    testConnection: jest.fn((entity) => entity),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        ShopService,
        EventTriggerService,
        { provide: FieldMapperService, useValue: mockFieldMapperService },
        { provide: ShopService, useValue: mockService },
        { provide: EventTriggerService, useValue: mockService },
        { provide: FileHandlersService, useValue: mockService },
        { provide: SyncPreferencesService, useValue: mockService },
        { provide: AutomationService, useValue: automationMockService },
        { provide: InventoryLevelSourceService, useValue: inventoryLevelSourceMockService },
        { provide: ConnectionAuthsService, useValue: connectionAuthsServiceMockService },
        { provide: BrandLabelService, useValue: BrandLabelServiceMockFactory },
        { provide: EmailSummaryService, useValue: mockService },
        { provide: AddressValidationTrackerService, useValue: mockService },
        { provide: ReportGeneratorService, useValue: mockService },
        { provide: TicketsService, useValue: mockService },
        { provide: ReportsService, useValue: ReportsServiceMockFactory },
        { provide: AnnouncementsService, useValue: announcementServiceMockFactory },
        { provide: AnnouncementTargetService, useValue: announcementTargetServiceMockFactory },
        { provide: QuestionnaireService, useValue: questionnaireServiceMockFactory },
        { provide: QuestionnaireTargetService, useValue: questionnaireTargetServiceMockFactory },
      ],
    }).compile()

    controller = module.get<ShopController>(ShopController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should test connection auth', async () => {
    const user = { entityId: 1, entityRole: 'customer', implementationIds: '1,2,3,4,6,21' }

    const connAuthId: number = 1

    const testConnectionSpy = jest.spyOn(controller, 'testConnection')
    const mockServiceTestConnectionSpy = jest.spyOn(mockService, 'testConnection').mockResolvedValue({})

    const result = await controller.testConnection(connAuthId, { user })

    expect(testConnectionSpy).toHaveBeenCalledWith(connAuthId, { user })
    expect(mockServiceTestConnectionSpy).toHaveBeenCalledWith(connAuthId)
    expect(result).toEqual({})
  })

  it('should throws an error when invalid input is provided: connection auth', async () => {
    const user = { entityId: 1, entityRole: 'customer', implementationIds: '1,2,3,4,6,21' }

    const connAuthId: number = 2

    expect.assertions(1)

    jest.spyOn(mockService, 'testConnection').mockRejectedValue(new HttpException('Not Authorized', 403))

    const result = controller.testConnection(connAuthId, { user })
    expect(result).rejects.toThrow(HttpException)
  })

  describe('Shop InventoryLevelSource API', () => {
    const implementation: Implementation = {
      id: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: 1,
      partnerId: 1,
      shopName: "1",
      wmsName: "xentral",
      implementationIdCustomer: null,
      implementationIdPartner: null,
      partnerLocationId: 1,
      customerLocationId: "Location-3",
      inventoryLevelSources: undefined,
      orders: undefined,
      inventoryLevels: undefined,
      notification: undefined,
      inventoryItems: undefined,
      partnerLocationInventoryItems: undefined,
      inboundNotices: undefined,
      customer: {
        id: 1,
        companyName: 'xentral',
        createdAt: new Date(),
        updatedAt: new Date(),
        implementations: undefined
      },
      partner: {
        id: 1,
        companyName: 'xentral',
        createdAt: new Date(),
        updatedAt: new Date(),
        implementations: undefined,
        locations: undefined,
        isTenant: false
      },
      partnerLocation: {
        id: 5,
        createdAt: new Date('2021-08-12T06:42:33'),
        updatedAt: new Date('2021-08-12T06:42:33'),
        partnerId: 1,
        addressLine1: 'Block-H',
        addressLine2: 'Canought Place',
        zipCode: '110001',
        city: 'New Delhi',
        region: 'Delhi',
        countryCodeIso: 'IN',
        implementations: undefined,
        inboundNotices: undefined,
        partnerLocationInventoryItems: undefined,
        partner: {
          id: 1,
          companyName: 'xentral',
          createdAt: new Date(),
          updatedAt: new Date(),
          implementations: undefined,
          locations: undefined,
          isTenant: false
        }
      },
      inventoryBundles: undefined,
      shipsWith: undefined,
      returnRequests: undefined,
      refundOrders: undefined,
      returnReasons: undefined,
      returnSteps: undefined,
      freeReturn: undefined,
    }

    const createInventoryLevelSourceDto: CreateInventoryLevelSourceDto = {
      eventAt: new Date("2022-06-01T05:22:27.262Z"),
      sku: "product-2",
      implementationId: 1,
      deltaQuantity: 10,
      event: EventType.order,
      eventEntityId: 1,
      type: InventoryType.physical
    }

    const inventoryLevelSource: InventoryLevelSource = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      inventoryItemSkuImplementation: "product-2_1",
      inventoryItem: <InventoryItem>{
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        sku: "product-2",
        skuImplementation: "product-2_1",
        implementationId: 1,
        customerItemId: null,
        partnerItemId: null,
        dimensions: {
          width: 10,
          height: 10,
          length: 10,
          weight: 10,
          widthUnit: "meters",
          heightUnit: "inch",
          lengthUnit: "meters",
          weightUnit: "kg"
        },
        name: "test",
        wmsSyncedAt: new Date(),
        shopSyncedAt: new Date(),
        source: "xentral",
        barcode: null,
        price: 10,
        harmonizedSystemCode: null,
        countryCodeOfOrigin: "IN",
        customerItemType: null,
        isBundle: false,
        inventoryLevelSources: undefined,
        inboundNoticeItems: undefined,
        inboundReceiptItems: undefined,
        inventoryBundle: undefined,
        implementation,
        returnShipmentItems: undefined,
        orderItems: undefined,
        partnerLocationInventoryItems: undefined,
        inventoryOfBundles: undefined,
        shipsWith: undefined,
        returnRequestItems: undefined,
      } as InventoryItem,
      implementation,
      ...createInventoryLevelSourceDto
    }

    const inventoryLevelSourceList = [inventoryLevelSource]

    const user = { entityId: 1, entityRole: 'customer', implementationIds: '1,2,3,4,6,21' }

    it('should find a inventoryLevelSource', async () => {
      const inventoryLevelSourceId: number = 1

      const getInventoryLevelSourceItemSpy = jest.spyOn(controller, 'getInventoryLevelSourceItem')
      const mockServiceGetInventoryLevelSourceItemSpy = jest.spyOn(mockService, 'getInventoryLevelSourceItem').mockResolvedValue(inventoryLevelSource)

      const result = await controller.getInventoryLevelSourceItem(inventoryLevelSourceId, { user })

      expect(getInventoryLevelSourceItemSpy).toHaveBeenCalledWith(inventoryLevelSourceId, { user })
      expect(mockServiceGetInventoryLevelSourceItemSpy).toHaveBeenCalledWith(inventoryLevelSourceId, user)
      expect(result).toEqual(inventoryLevelSource)
    })

    it('should be possible to filter by InventoryLevelSource attributes', async () => {
      const paginatorFields = {
        page: 1,
        limit: 10
      }

      const filter: QueryInventoryLevelSourceDto = {
        ...paginatorFields,
        event: EventType.order,
        eventEntityId: 1,
        type: InventoryType.physical
      }
      const responseObj = {
        items: inventoryLevelSourceList,
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1
        },
        links: {
          first: "/inventory-level-source/filter/?limit=10",
          previous: "",
          next: "",
          last: "/inventory-level-source/filter/?page=1&limit=10"
        }
      }

      const filterInventoryLevelSourceSpy = jest.spyOn(controller, 'filterInventoryLevelSourceItems')
      const inventoryLevelSourceMockServiceFindByFilterSpy = jest.spyOn(mockService, 'filterInventoryLevelSourceItems').mockReturnValue([responseObj])

      const result = await controller.filterInventoryLevelSourceItems(filter, { user })

      expect(filterInventoryLevelSourceSpy).toHaveBeenCalledWith(filter, { user })
      expect(inventoryLevelSourceMockServiceFindByFilterSpy).toHaveBeenCalledWith(filter, user)
      expect(result).toEqual([responseObj])
    })
  })

  describe('Shop AutomationRule API', () => {
    const automationRule = {
      implementationId: 1,
      action: ActionEnum.getMany,
      entity: EntityEnum.order,
      targetType: OrgType.Shop,
      name: AutomationName.OrderCancelNotification,
      rules: [{
        conditions: {
          all: [{
            fact: 'placedAt',
            operator: 'lessThanInclusive',
            value: { fact: "Test" }
          }]
        },
        event: {
          type: 'keepOrder',
          params: {
            message: 'Can Keep this order'
          }
        }
      }],
      isActive: true
    }
    const newAutomationRule: AutomationRule = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...automationRule
    }

    const automationRuleList = [newAutomationRule, { ...newAutomationRule, id: 2 }]

    const user = { entityId: 1, entityRole: 'customer', implementationIds: '1,2,3,4,6,21' }

    it('should find a AutomationRule using AutomationService', async () => {
      const automationRuleId: number = 1

      const getAutomationRuleSpy = jest.spyOn(controller, 'getAutomationRule')
      jest.spyOn(automationMockService, 'findOne').mockResolvedValue(newAutomationRule)

      const result = await controller.getAutomationRule(automationRuleId, { user })

      expect(getAutomationRuleSpy).toHaveBeenCalledWith(automationRuleId, { user })
      expect(await automationMockService.findOne).toHaveBeenCalledWith(automationRuleId, user)
      expect(result).toEqual(newAutomationRule)
    })

    it('should create a AutomationRule using AutomationService', async () => {
      const createAutomationDto: CreateAutomationDto = automationRule

      const createAutomationRuleSpy = jest.spyOn(controller, 'createAutomationRule')
      const automationMockServiceCreateSpy = jest.spyOn(automationMockService, 'create').mockResolvedValue(newAutomationRule)

      const result = await controller.createAutomationRule(createAutomationDto, { user })

      expect(createAutomationRuleSpy).toHaveBeenCalledWith(createAutomationDto, { user })
      expect(automationMockServiceCreateSpy).toHaveBeenCalledWith(createAutomationDto, user)
      expect(result).toEqual(newAutomationRule)
    })

    it('should be possible to filter by AutomationRule attributes', async () => {
      const paginatorFields = {
        page: 1,
        limit: 10
      }
      const options: IPaginationOptions = {
        ...paginatorFields,
        route: mainConfigs.URL + '/automation-rule/filter/'
      }
      const filter: QueryAutomationDto = {
        ...paginatorFields,
        targetType: OrgType.Shop,
        action: ActionEnum.getMany,
        entity: EntityEnum.order,
      }
      const responseObj = {
        items: automationRuleList,
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1
        },
        links: {
          first: "/automation-rule/filter/?limit=10",
          previous: "",
          next: "",
          last: "/automation-rule/filter/?page=1&limit=10"
        }
      }

      const filterAutomationRulesSpy = jest.spyOn(controller, 'filterAutomationRules')
      const automationMockServiceFindByFilterSpy = jest.spyOn(automationMockService, 'findByFilter').mockReturnValue([responseObj])

      const result = await controller.filterAutomationRules(filter, { user })

      expect(filterAutomationRulesSpy).toHaveBeenCalledWith(filter, { user })
      expect(automationMockServiceFindByFilterSpy).toHaveBeenCalledWith(filter, options, user)
      expect(result).toEqual([responseObj])
    })

    it('should be possible to update a AutomationRule using AutomationService', async () => {
      const automationRuleId: number = 1
      const updateAutomationDto: UpdateAutomationDto = {
        implementationId: 3,
        action: ActionEnum.getMany,
        entity: EntityEnum.inventoryItem,
        targetType: OrgType.Wms,
        rules: [{
          conditions: {
            all: [{
              fact: 'placedAt',
              operator: 'lessThanInclusive',
              value: { fact: "Test" }
            }]
          },
          event: {
            type: 'keepOrder',
            params: {
              message: 'Can Keep this order'
            }
          }
        }]
      }

      jest.spyOn(controller, 'updateAutomationRule')
      jest.spyOn(automationMockService, 'update').mockResolvedValue({ affected: 1 })

      await controller.updateAutomationRule(automationRuleId, updateAutomationDto, { user })

      expect(await automationMockService.update).toHaveBeenCalledWith(automationRuleId, updateAutomationDto, user)
      expect(controller.updateAutomationRule).toHaveBeenCalledWith(automationRuleId, updateAutomationDto, { user })
    })

    it('should remove an AutomationRule using AutomationService', async () => {
      const automationRuleId: number = 1

      jest.spyOn(controller, 'removeAutomationRule')
      jest.spyOn(automationMockService, 'remove').mockResolvedValue({ affected: 1 })

      await controller.removeAutomationRule(automationRuleId, { user })

      expect(await automationMockService.remove).toHaveBeenCalledWith(automationRuleId, user)
      expect(controller.removeAutomationRule).toHaveBeenCalledWith(automationRuleId, { user })
    })
  })

  describe('ShopController Implementation API', () => {
    let implementationResponseList = [{
      id: 1,
      shopName: 'shopify',
      wmsName: 'xentral',
      implementationIdCustomer: 'SHOP1',
      implementationIdPartner: 'WMS1',
      customerId: 1,
      partnerId: 2
    }]
    let implementationResponse = implementationResponseList[0]

    it('should be possible to filter by Implementation attributes', async () => {
      expect(await controller.filterImplementations(implementationResponse, {})).toStrictEqual(implementationResponseList)
      expect(mockService.filterImplementations).toHaveBeenCalledWith(implementationResponse, undefined)
    })

    it('should get the Implementation using ShopService', async () => {
      mockService.getImplementation.mockReturnValue(implementationResponse)
      expect(await controller.getImplementation(implementationResponse.id, {})).
        toEqual(implementationResponse)
    })
  })

  describe('ShopController PartnerLocation API', () => {
    let partnerLocationResponseList = [{
      id: 1,
      createdAt: new Date('2021-08-11T11:47:48'),
      updatedAt: new Date('2021-08-11T11:47:48'),
      partnerId: 1,
      addressLine1: 'Block-3',
      addressLine2: 'Manhatten',
      zipCode: '110020',
      city: 'New York',
      region: 'York',
      countryCodeIso: 'US'
    }]
    let partnerLocationResponse = partnerLocationResponseList[0]

    it('should be possible to filter by loacation attributes', async () => {
      expect(await controller.filterPartnerLocations(partnerLocationResponse, {})).toStrictEqual(partnerLocationResponseList)
      expect(mockService.filterPartnerLocations).toHaveBeenCalledWith(partnerLocationResponse, undefined)
    })

    it('should get the PartnerLocation using ShopService', async () => {
      mockService.getPartnerLocation.mockReturnValue(partnerLocationResponse)
      expect(await controller.getPartnerLocation(partnerLocationResponse.id, {})).
        toEqual(partnerLocationResponse)
    })
  })

  describe('ShopController Order API', () => {
    const order = {
      customerOrderId: 'SKU1',
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
      orderItems: [],
      orderHistories: []
    }


    it('should be possible to filter by order attributes', async () => {
      const filter = {
        ...order,
        total: '{"gte": 1000}',
        createdAt: '{"gte": "2021-08-13T15:13:24.449Z"}',
        updatedAt: '{"gte": "2021-08-13T15:13:24.449Z"}',
        placedAt: '{"gte": "2021-08-13T15:13:24.449Z"}'
      }
      expect(await controller.filterOrders(filter, {})).toStrictEqual([filter])
      expect(mockService.filterOrders).toHaveBeenCalledWith(filter, undefined)
    })

    it('should find an order', async () => {
      const id: number = 1
      await controller.getOrder(id, {})
      expect(mockService.getOrder).toHaveBeenCalledWith(id, undefined)
    })


    it('should create an order', async () => {
      expect(await controller.createOrder(order, {})).toBe(order)
      expect(mockService.createOrder).toHaveBeenCalledWith(order, undefined)
    })

    it('should be possible to update an order', async () => {
      const id: number = 1
      await controller.updateOrder(id, order, {})
      expect(mockService.updateOrder).toHaveBeenCalledWith(id, order, undefined)
    })
  })

  describe('ShopController Order History API', () => {
    const order_history = {
      orderId: 1,
      status: 'new',
      source: 'some',
    }


    it('should be possible to filter by order history attributes', async () => {
      expect(await controller.filterOrderHistories(order_history, {})).toStrictEqual([order_history])
      expect(mockService.filterOrderHistories).toHaveBeenCalledWith(order_history, undefined)
    })

    it('should find an order history', async () => {
      const id: number = 1
      await controller.getOrderHistory(id, {})
      expect(mockService.getOrderHistory).toHaveBeenCalledWith(id, undefined)
    })


    it('should create an order history', async () => {
      expect(await controller.createOrderHistory(order_history, {})).toBe(order_history)
      expect(mockService.createOrderHistory).toHaveBeenCalledWith(order_history, undefined)
    })

    it('should be possible to update an order history', async () => {
      const id: number = 1
      await controller.updateOrderHistory(id, order_history, {})
      expect(mockService.updateOrderHistory).toHaveBeenCalledWith(id, order_history, undefined)
    })
  })

  describe('ShopController Order Item API', () => {
    const order_item = {
      id: 1,
      createdAt: '2021-08-13T15:13:24.449Z',
      updatedAt: '2021-08-13T15:13:24.449Z',
      orderId: 1,
      inventoryItemSku: 'SKU1',
      pricePaid: 110,
      quantity: 2,
      currency: 'EUR'
    }


    it('should be possible to filter by order item attributes', async () => {
      const filter = {
        ...order_item,
        pricePaid: '{"gte": 1000}', quantity: '{"gte": 1000}',
        createdAt: '{"gte": "2021-08-13T15:13:24.449Z"}', updatedAt: '{"gte": "2021-08-13T15:13:24.449Z"}'
      }
      expect(await controller.filterOrderItems(filter, {})).toStrictEqual([filter])
      expect(mockService.filterOrderItems).toHaveBeenCalledWith(filter, undefined)
    })

    it('should find an order item', async () => {
      const id: number = 1
      await controller.getOrderItem(id, {})
      expect(mockService.getOrderItem).toHaveBeenCalledWith(id, undefined)
    })

    it('should be possible to update an order item', async () => {
      const id: number = 1
      await controller.updateOrderItem(id, order_item, {})
      expect(mockService.updateOrderItem).toHaveBeenCalledWith(id, order_item, undefined)
    })
  })

  describe('ShopController OutboundShipment API', () => {
    const outboundShipment = {
      id: 1,
      createdAt: "2021-08-15T10:52:59.029Z",
      updatedAt: "2021-08-15T10:52:59.029Z",
      orderId: 1,
      partnerShipmentId: "1",
      carrier: "dhl",
      trackingCode: "123454321",
      shippingFirstName: "rishabh",
      shippingLastName: "sengar",
      shippingAddressLine1: "sector 23",
      shippingAddressLine2: "",
      shippingCompanyName: "warehousing1",
      shippingEmail: "rishabh.sengar@warehousing1.com",
      shippingZip: "122017",
      shippingCity: "Gurgaon",
      shippingRegion: "",
      shippingCountryCodeIso: "IN",
      shippingPhone: "8695574235",
      shippingMethod: "dhl",
      paymentMethod: "manual",
      outboundShipmentItems: [],
      outboundShipmentHistories: []
    }

    it('should be possible to filter by outboundShipment attributes', async () => {
      expect(await controller.filterOutboundShipments(outboundShipment, {})).toStrictEqual([outboundShipment])
      expect(mockService.filterOutboundShipments).toHaveBeenCalledWith(outboundShipment, undefined)
    })

    it('should find an outboundShipment', async () => {
      const id: number = 1
      await controller.getOutboundShipment(id, {})
      expect(mockService.getOutboundShipment).toHaveBeenCalledWith(id, undefined)
    })
  })

  describe('ShopController OutboundShipment API', () => {
    const returnShipment = {
      id: 1,
      createdAt: new Date('2021-08-11T11:47:48'),
      updatedAt: new Date('2021-08-11T11:47:48'),
      orderId: 2,
      returnShipmentItems: []
    }

    it('should be possible to filter by returnShipment attributes', async () => {
      const filter = {
        ...returnShipment,
        createdAt: '{"gte": "2021-08-13T15:13:24.449Z"}',
        updatedAt: '{"gte": "2021-08-13T15:13:24.449Z"}',
      }
      expect(await controller.filterReturnShipments(filter, {})).toStrictEqual([filter])
      expect(mockService.filterReturnShipments).toHaveBeenCalledWith(filter, undefined)
    })

    it('should find an returnShipment', async () => {
      const id: number = 1
      await controller.getReturnShipment(id, {})
      expect(mockService.getReturnShipment).toHaveBeenCalledWith(id, undefined)
    })
  })

  describe('ShopController InventoryItem API', () => {
    const inventoryItem = {
      id: 1,
      sku: 'SKU1',
      implementationId: 1,
      source: 'some'
    }

    it('should be possible to filter by inventoryItem attributes', async () => {
      expect(await controller.filterInventoryItems(inventoryItem, {})).toStrictEqual([inventoryItem])
      expect(mockService.filterInventoryItems).toHaveBeenCalledWith(inventoryItem, undefined)
    })

    it('should find an inventoryItem', async () => {
      const id: number = 1
      await controller.getInventoryItem(id, {})
      expect(mockService.getInventoryItem).toHaveBeenCalledWith(id, undefined)
    })

    it('should create an inventoryItem', async () => {
      expect(await controller.createInventoryItem(inventoryItem, {})).toBe(inventoryItem)
      expect(mockService.createInventoryItem).toHaveBeenCalledWith(inventoryItem, undefined)
    })

    it('should be possible to update an inventoryItem', async () => {
      const id: number = 1
      await controller.updateInventoryItem(id, false, inventoryItem, {})
      expect(mockService.updateInventoryItem).toHaveBeenCalledWith(id, inventoryItem, false, undefined)
    })
  })

  describe('ShopController partnerLocationInventoryItem API', () => {
    const partnerLocationInventoryItem = {
      id: 1,
      createdAt: new Date('2021-08-11T11:47:48'),
      updatedAt: new Date('2021-08-11T11:47:48'),
      partnerLocationId: 1,
      implementationId: 1,
      inventoryItemSku: 'SKU1',
      quantityAvailable: '54',
    }

    it('should be possible to filter by partnerLocationInventoryItem attributes', async () => {
      expect(await controller.filterPartnerLocationInventoryItems(partnerLocationInventoryItem, {})).toStrictEqual([partnerLocationInventoryItem])
      expect(mockService.filterPartnerLocationInventoryItems).toHaveBeenCalledWith(partnerLocationInventoryItem, undefined)
    })

    it('should find an partnerLocationInventoryItem', async () => {
      const id: number = 1
      await controller.getPartnerLocationInventoryItem(id, {})
      expect(mockService.getPartnerLocationInventoryItem).toHaveBeenCalledWith(id, undefined)
    })
  })

  describe('ShopController FieldMapper API', () => {
    const fieldMapperObj = {
      entityType: 'order',
      entityField: 'partnerOrderId',
      wmsValue: 'UPS',
      shopValue: 'UPS_1',
      implementationId: 1,
      name: 'order-carrier-value',
      id: 1,
      createdAt: "2021-12-23T11:16:17.987Z",
      updatedAt: "2021-12-23T11:16:17.987Z"
    }
    let userHeaders: JwtUser = { entityId: 1, entityRole: 'partner', implementationIds: '1,2,3,4' }
    let paginate = { page: 1, limit: 10 }

    it('should be possible to filter by FieldMapper attributes', async () => {
      mockFieldMapperService.findByFilter.mockReturnValue([fieldMapperObj])
      expect(await controller.filterFieldMapper(
        { wmsValue: 'UPS', ...paginate }, {})).
        toStrictEqual([fieldMapperObj])
    })

    it('should find an FieldMapper', async () => {
      const id: number = 1
      mockFieldMapperService.findOne.mockReturnValue(fieldMapperObj)
      expect(await controller.getFieldMapper(id, userHeaders)).toStrictEqual(fieldMapperObj)
    })

    it('should create an FieldMapper', async () => {
      mockFieldMapperService.create.mockReturnValue(fieldMapperObj)
      expect(await controller.createFieldMapper(fieldMapperObj, userHeaders)).toStrictEqual(fieldMapperObj)
    })
  })

  describe('ShopController Notification API', () => {
    const notification = {
      id: 1,
      entityType: 'Order',
      entityId: 303,
      type: 'MISSING_SKUS',
      notifyOn: '2022-02-01T07:26:26.314Z',
      implementationId: 1,
      resolved: false,
      archived: false,
      priority: 2,
    }

    it('should be possible to filter by notification attributes', async () => {
      expect(await controller.filterNotifications(notification, {})).toStrictEqual([notification])
      expect(mockService.filterNotifications).toHaveBeenCalledWith(notification, undefined)
    })

    it('should find an notification', async () => {
      const id: number = 1
      await controller.getNotification(id, {})
      expect(mockService.getNotification).toHaveBeenCalledWith(id, undefined)
    })

    it('should be possible to update an notification', async () => {
      const id: number = 1
      const updateInfo = {
        entityType: 'Order',
        entityId: 304,
        type: 'MISSING_SKUS',
      }
      await controller.updateNotification(id, updateInfo, {})
      expect(mockService.updateNotification).toHaveBeenCalledWith(id, updateInfo, undefined)
    })
  })

  describe('ShopController ReturnSteps API', () => {

    const queryDto: QueryReturnStepsDto = {
      implementationId: 1
    }

    it('should be possible to filter by ReturnSteps attributes', async () => {
      await controller.filterReturnSteps(queryDto, {})
      expect(mockService.filterReturnSteps).toHaveBeenCalledWith(queryDto, undefined)
    })

    it('should find a ReturnSteps', async () => {
      const id: number = 1
      await controller.getReturnStep(id, {})
      expect(mockService.getReturnStep).toHaveBeenCalledWith(id, undefined)
    })

    it('should be possible to update a ReturnSteps', async () => {
      const id: number = 1
      const updateReturnStepsDto: UpdateReturnStepsDto = {
        isFreeStep: false
      }
      await controller.updateNotification(id, updateReturnStepsDto, {})
      expect(mockService.updateNotification).toHaveBeenCalledWith(id, updateReturnStepsDto, undefined)
    })

    it('should be possible to create a ReturnSteps', async () => {
      const createReturnStepsDto: CreateReturnStepsDto = {
        implementationId: 1,
        stepNumber: 1,
        contentDe: 'string',
        contentEn: 'string',
        isFreeStep: true
      }
      await controller.createReturnStep(createReturnStepsDto, {})
      expect(mockService.createReturnStep).toHaveBeenCalledWith(createReturnStepsDto, undefined)
    })
  })

})

