import { of } from 'rxjs'
import { OrdersService } from '../../../src/orders/orders.service'
import OrderFilterPaginateResponseDummy from '../../dummies/common/order/order-filter-paginate-response.dummy.json'
import { MockType } from '../../utils/mock-type'

export const OrderServiceMockFactory: () => MockType<OrdersService> = jest.fn(() => ({
  filterOrderByCurrentStatus: jest.fn(() => { return Promise.resolve() }),
  filterOrders: jest.fn(() => { return of(OrderFilterPaginateResponseDummy) }),
  getB2cOrder: jest.fn(() => { return Promise.resolve() }),
  getOrder: jest.fn(() => { return of({}) }),
  createOrder: jest.fn(() => { return Promise.resolve() }),
  updateOrder: jest.fn(() => { return Promise.resolve() }),
  releaseOrders: jest.fn(() => { return Promise.resolve() }),
  filterOrderHistories: jest.fn(() => { return Promise.resolve() }),
  getOrderHistory: jest.fn(() => { return Promise.resolve() }),
  createOrderHistory: jest.fn(() => { return Promise.resolve() }),
  updateOrderHistory: jest.fn(() => { return Promise.resolve() }),
  filterOrderItems: jest.fn(() => { return Promise.resolve() }),
  getOrderItem: jest.fn(() => { return Promise.resolve() }),
  updateOrderItem: jest.fn(() => { return Promise.resolve() }),
  filterExistingIds: jest.fn(() => { return Promise.resolve() }),
  updateOrCreateOrders: jest.fn(() => { return of() }),
  bulkCreateOrderHistory: jest.fn(() => { return Promise.resolve() }),
  changeOrder: jest.fn(() => { return Promise.resolve() }),
  isFulfillmentReadyAndUpdateOrder: jest.fn(() => { return Promise.resolve() }),
  createOrderHistoryOfNewAndUpdateShop: jest.fn((id, object) => of()),
}))