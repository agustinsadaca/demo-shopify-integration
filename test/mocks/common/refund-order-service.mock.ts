import { RefundOrdersService } from '../../../src/refund-orders/refund-orders.service'
import { MockType } from '../../utils/mock-type'

export const RefundOrdersServiceMockFactory: () => MockType<RefundOrdersService> = jest.fn(() => ({
  filterRefundOrders: jest.fn(() => {
    return Promise.resolve()
  }),
  getRefundOrder: jest.fn(() => {
    return Promise.resolve()
  }),
  createRefundOrder: jest.fn(() => {
    return Promise.resolve()
  }),
  filterRefundOrderItems: jest.fn(() => {
    return Promise.resolve()
  }),
  getRefundOrderItem: jest.fn(() => {
    return Promise.resolve()
  }),
  calculateRefundOrder: jest.fn(() => {
    return Promise.resolve()
  }),
  createRefundOrderAfterRefundCalculation: jest.fn(() => {
    return Promise.resolve()
  }),
}))