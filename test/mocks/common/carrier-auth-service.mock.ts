import { CarrierAuthService } from '../../../src/carrier-auth/carrier-auth.service'
import { MockType } from '../../utils/mock-type'

export const CarrierAuthServiceMockFactory: () => MockType<CarrierAuthService> = jest.fn(() => ({
  findByImplementationId: jest.fn()
}))