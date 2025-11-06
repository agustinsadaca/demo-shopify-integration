import { CreateOrderDto } from '@digital-logistics-gmbh/wh1plus-common'
import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { ShippingMethodUtilServiceMockFactory } from '../../test/mocks/common/shipping-method-util-service.mock'
import { MockType } from '../../test/utils/mock-type'
import { AddressValidationService } from '../address-validation/address-validation.service'
import { AutomationEngineService } from '../automation/automation-engine.service'
import { ConnectionAuthsService } from '../connection-auths/connection-auths.service'
import { EventTriggerService } from '../event-trigger/event-trigger-service'
import { FreeReturnService } from '../free-returns/free-returns.service'
import { ImplementationsService } from '../implementations/implementations.service'
import { InboundNoticesService } from '../inbound-notices/inbound-notices.service'
import { InboundReceiptsService } from '../inbound-receipts/inbound-receipts.service'
import { InventoryBundlesService } from '../inventory-bundles/inventory-bundles.service'
import { InventoryItemsService } from '../inventory-items/inventory-items.service'
import { InventoryLevelSourceService } from '../inventory-level-source/inventory-level-source.service'
import { NotificationsService } from '../notifications/notifications.service'
import { OrdersService } from '../orders/orders.service'
import { OutboundShipmentsService } from '../outbound-shipments/outbound-shipments.service'
import { PartnerLocationInventoryItemsService } from '../partner-location-inventory-items/partner-location-inventory-items.service'
import { PartnerLocationStorageItemsService } from '../partner-location-storage-item/partner-location-storage-items.service'
import { PartnerLocationsService } from '../partner-locations/partner-locations.service'
import { RefundOrdersService } from '../refund-orders/refund-orders.service'
import { ReturnReasonService } from '../return-reasons/return-reasons.service'
import { ReturnShipmentsService } from '../return-shipments/return-shipments.service'
import { ReturnStepsService } from '../return-steps/return-steps.service'
import { ShippingMethodUtilService } from '../shipping-method-util/shipping-method-util.service'
import { ShipsWithService } from '../ships-with/ships-with.service'
import { ShopConnectorsService } from '../shop-connectors/shop-connectors.service'
import { ShopifyService } from '../shop-connectors/shopify/shopify.service'
import { ShopIntegrationService } from '../shop-integration/shop-integration.service'
import { TrackingsService } from '../trackings/trackings.service'
import { ShopService } from './shop.service'

describe('ShopService', () => {
  let service: ShopService
  let ordersService: MockType<OrdersService>
  let shippingMethodUtilService: MockType<ShippingMethodUtilService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        ImplementationsService,
        OrdersService,
        OutboundShipmentsService,
        ReturnShipmentsService,
        PartnerLocationsService,
        InventoryItemsService,
        PartnerLocationInventoryItemsService,
        PartnerLocationStorageItemsService,
        InventoryLevelSourceService,
        EventTriggerService,
        AutomationEngineService,
        { provide: ShopIntegrationService, useFactory: serviceMockFactory },
        { provide: ImplementationsService, useFactory: serviceMockFactory },
        { provide: OrdersService, useFactory: serviceMockFactory },
        { provide: OutboundShipmentsService, useFactory: serviceMockFactory },
        { provide: ReturnShipmentsService, useFactory: serviceMockFactory },
        { provide: PartnerLocationsService, useFactory: serviceMockFactory },
        { provide: InventoryItemsService, useFactory: serviceMockFactory },
        { provide: PartnerLocationInventoryItemsService, useFactory: serviceMockFactory },
        { provide: PartnerLocationStorageItemsService, useFactory: serviceMockFactory },
        { provide: EventTriggerService, useFactory: serviceMockFactory },
        { provide: NotificationsService, useFactory: serviceMockFactory },
        { provide: InboundNoticesService, useFactory: serviceMockFactory },
        { provide: InboundReceiptsService, useFactory: serviceMockFactory },
        { provide: InventoryBundlesService, useFactory: serviceMockFactory },
        { provide: InventoryLevelSourceService, useFactory: serviceMockFactory },
        { provide: ShipsWithService, useFactory: serviceMockFactory },
        { provide: ConnectionAuthsService, useFactory: serviceMockFactory },
        { provide: TrackingsService, useFactory: serviceMockFactory },
        { provide: RefundOrdersService, useFactory: serviceMockFactory },
        { provide: ReturnReasonService, useFactory: serviceMockFactory },
        { provide: FreeReturnService, useFactory: serviceMockFactory },
        { provide: ShopConnectorsService, useFactory: serviceMockFactory },
        { provide: ReturnStepsService, useFactory: serviceMockFactory },
        { provide: AutomationEngineService, useFactory: serviceMockFactory },
        { provide: AddressValidationService, useFactory: serviceMockFactory },
        { provide: ShopifyService, useFactory: serviceMockFactory },
        { provide: ShippingMethodUtilService, useFactory: ShippingMethodUtilServiceMockFactory }
      ]
    }).compile()

    service = module.get<ShopService>(ShopService)
    ordersService = module.get(OrdersService)
    shippingMethodUtilService = module.get(ShippingMethodUtilService)

    ordersService.createOrder = jest.fn().mockReturnValue(of({}))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createOrder', () => {
    it('should generate customerOrderId with timestamp when channel is manual and no customerOrderId is provided', async () => {
      const mockTimestamp = 1650000000000
      Date.now = jest.fn().mockReturnValue(mockTimestamp)

      const createOrderDto: CreateOrderDto = {
        channel: 'manual',
        implementationId: 1,
        orderItems: [],
        shippingFirstName: '',
        shippingAddressLine1: '',
        shippingZip: '',
        shippingCity: '',
        shippingCountryCodeIso: '',
        shippingMethod: ''
      }

      const user = {
        entityId: 1,
        entityRole: 'shop',
        implementationIds: '1'
      }

      await service.createOrder(createOrderDto, user)

      expect(createOrderDto.customerOrderId).toBe(`wh1_manual_${mockTimestamp}`)

      expect(ordersService.createOrder).toHaveBeenCalledWith(createOrderDto, user)

      expect(
        shippingMethodUtilService.attachIsShippingMethodUnknownToMetaInfoInOrders
      ).toHaveBeenCalledWith(createOrderDto, createOrderDto.implementationId)
    })

    it('should append timestamp to existing customerOrderId when channel is manual', async () => {
      const mockTimestamp = 1650000000000
      Date.now = jest.fn().mockReturnValue(mockTimestamp)

      const existingCustomerId = 'TEST123'
      const createOrderDto: CreateOrderDto = {
        channel: 'manual',
        implementationId: 1,
        orderItems: [],
        shippingFirstName: '',
        shippingAddressLine1: '',
        shippingZip: '',
        shippingCity: '',
        shippingCountryCodeIso: '',
        shippingMethod: '',
        customerOrderId: existingCustomerId
      }

      const user = {
        entityId: 1,
        entityRole: 'shop',
        implementationIds: '1'
      }

      await service.createOrder(createOrderDto, user)

      expect(createOrderDto.customerOrderId).toBe(
        `wh1_manual_${mockTimestamp}_${existingCustomerId}`
      )

      expect(ordersService.createOrder).toHaveBeenCalledWith(createOrderDto, user)
    })

    it('should not modify customerOrderId when channel is not manual', async () => {
      const existingCustomerId = 'TEST123'
      const createOrderDto: CreateOrderDto = {
        channel: 'shopify',
        implementationId: 1,
        orderItems: [],
        shippingFirstName: '',
        shippingAddressLine1: '',
        shippingZip: '',
        shippingCity: '',
        shippingCountryCodeIso: '',
        shippingMethod: '',
        customerOrderId: existingCustomerId
      }

      const user = {
        entityId: 1,
        entityRole: 'shop',
        implementationIds: '1'
      }

      await service.createOrder(createOrderDto, user)

      expect(createOrderDto.customerOrderId).toBe(existingCustomerId)
    })
  })
})

const serviceMockFactory: () => MockType<any> = jest.fn(() => ({}))
