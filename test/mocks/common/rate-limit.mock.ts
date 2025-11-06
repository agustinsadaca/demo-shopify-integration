import { RateLimitUtil } from '../../../src/shop-connectors/utils/rate-limit.util'
import { MockType } from '../../utils/mock-type'

export const RateLimitUtilMockFactory: () => MockType<RateLimitUtil> = jest.fn(() => ({
  handleRateLimit: jest.fn((entity, object) => Promise.resolve()),
}))