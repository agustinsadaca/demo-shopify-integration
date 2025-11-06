import { ShippingMethodUtilService } from '../../../src/shipping-method-util/shipping-method-util.service'
import { MockType } from '../../utils/mock-type'

export const ShippingMethodUtilServiceMockFactory: () => MockType<ShippingMethodUtilService> = jest.fn(() => ({
  attachIsShippingMethodUnknownToMetaInfoInOrders: jest.fn(),
}))