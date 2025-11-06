import { CalculateRefundOrderDto } from '@digital-logistics-gmbh/wh1plus-common/dist'

const calculateRefundOrderDtoRequestDummy: CalculateRefundOrderDto = {
  orderId: 147,
  implementationId: 106,
  orderItems: [{
    orderItemId: 261,
    sku: 'bundle_1',
    quantity: 2
  }],
  refundShipping: false,
  isRefundRequired: false
}

export default calculateRefundOrderDtoRequestDummy