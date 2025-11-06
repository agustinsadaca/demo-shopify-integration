import { CalculateRefundOrderDto } from '../../refund-orders/dtos/calculate-refund-order.dto'
import { CancelledOrderDetails } from './cancelled-order-details.interface'

export interface UpdateCancelledOrdersData {
  orderDetails: CancelledOrderDetails[]
  refundOrders: CalculateRefundOrderDto[]
}

export interface UpdateCancelledOrdersDataRetryData {
  orderDetails: CancelledOrderDetails[]
  refundOrders: CalculateRefundOrderDto[]
}
