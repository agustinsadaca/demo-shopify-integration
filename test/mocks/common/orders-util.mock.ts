import { OrdersUtil } from '../../../src/shop-connectors/utils/orders.util'
import { MockType } from '../../utils/mock-type'

export const OrdersUtilMockFactory: () => MockType<OrdersUtil> = jest.fn(() => {
  return {
    addInLongNumber: jest.fn(() => {
      return Promise.resolve('1234')
    }),
    getLastSyncedAtFromResponse: jest.fn(() => { return new Date() }),
    setLastSyncedOrderNumber: jest.fn(() => { return Promise.resolve() }),
    filterOrders: jest.fn((message: any, filter: any, orders: any, targetSystemEnum: string) => {
      return Promise.resolve(orders)
    }),
    processLastSyncDate: jest.fn(() => { return Promise.resolve() }),
    setLastSyncedCustomerOrderId: jest.fn(() => { return Promise.resolve() }),
  }
})