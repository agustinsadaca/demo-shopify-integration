import { CalculateRefundOrderResponseDto } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import calculateRefundOrderDtoRequestDummy from '../../test/dummies/common/refund-order/calculate-refund-order-request.dummy'
import orderDummyResponse from '../../test/dummies/common/refund-order/order.dummy'
import { HttpServiceMockFactory } from '../../test/mocks/common/http.mock'
import { OrderServiceMockFactory } from '../../test/mocks/common/order-service.mock'
import { HttpMiddlewareService } from '../core/http-middleware.service'
import { OrdersService } from '../orders/orders.service'
import { RefundOrdersService } from './refund-orders.service'

describe('RefundOrdersService', () => {
  let service: RefundOrdersService
  let ordersService: OrdersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundOrdersService,
        { provide: HttpMiddlewareService, useValue: HttpServiceMockFactory },
        { provide: OrdersService, useFactory: OrderServiceMockFactory },
      ],
    }).compile()

    service = module.get<RefundOrdersService>(RefundOrdersService)
    ordersService = module.get<OrdersService>(OrdersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('calculate refund order', () => {
    it('should calulate for refundShipping: true', async () => {
      const resposne = {
        shopResponse: {},
        refundOrder: {
          orderId: orderDummyResponse.id,
          implementationId: orderDummyResponse.implementationId,
          lineItemsTotal: 20,
          lineItemsTotalTax: 3.19,
          shippingTotal: orderDummyResponse.shippingCost,
          shippingTotalTax: orderDummyResponse.shippingTaxAmount,
          discountTotal: orderDummyResponse.discount,
          totalTax: orderDummyResponse.totalTaxAmount,
          total: orderDummyResponse.total,
          returnShipmentId: undefined,
          refundOrderItems: [
            {
              id: orderDummyResponse.orderItems[0].id,
              sku: orderDummyResponse.orderItems[0].inventoryItemSku,
              unitPrice: orderDummyResponse.orderItems[0].unitPrice,
              unitTax: orderDummyResponse.orderItems[0].taxAmount / orderDummyResponse.orderItems[0].quantity,
              totalTax: orderDummyResponse.orderItems[0].taxAmount,
              total: orderDummyResponse.orderItems[0].pricePaid,
              quantity: orderDummyResponse.orderItems[0].quantity,
              skuImplementation: undefined,
            }
          ]
        }
      }

      jest.spyOn(ordersService, 'getOrder').mockImplementation(() => of(orderDummyResponse))

      const calculateRefundOrderResponse: CalculateRefundOrderResponseDto = await service.calculateRefundOrder(calculateRefundOrderDtoRequestDummy)
      expect(calculateRefundOrderResponse).toStrictEqual(resposne)
    })

    it('should calulate for refundShipping: false', async () => {
      const resposne = {
        shopResponse: {},
        refundOrder: {
          orderId: orderDummyResponse.id,
          implementationId: orderDummyResponse.implementationId,
          lineItemsTotal: 20,
          lineItemsTotalTax: 3.19,
          shippingTotal: orderDummyResponse.shippingCost,
          shippingTotalTax: orderDummyResponse.shippingTaxAmount,
          discountTotal: orderDummyResponse.discount,
          totalTax: orderDummyResponse.totalTaxAmount,
          total: orderDummyResponse.total - orderDummyResponse.shippingCost,
          returnShipmentId: undefined,
          refundOrderItems: [
            {
              id: orderDummyResponse.orderItems[0].id,
              sku: orderDummyResponse.orderItems[0].inventoryItemSku,
              unitPrice: orderDummyResponse.orderItems[0].unitPrice,
              unitTax: orderDummyResponse.orderItems[0].taxAmount / orderDummyResponse.orderItems[0].quantity,
              totalTax: orderDummyResponse.orderItems[0].taxAmount,
              total: orderDummyResponse.orderItems[0].pricePaid,
              quantity: orderDummyResponse.orderItems[0].quantity,
              skuImplementation: undefined,
            }
          ]
        }
      }

      jest.spyOn(ordersService, 'getOrder').mockImplementation(() => of(orderDummyResponse))

      const calculateRefundOrderResponse: CalculateRefundOrderResponseDto = await service.calculateRefundOrder(calculateRefundOrderDtoRequestDummy)
      expect(calculateRefundOrderResponse).toStrictEqual(resposne)
    })
  })
})

