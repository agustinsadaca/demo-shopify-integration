import { FreeReturnService } from '../../../src/free-returns/free-returns.service'
import { MockType } from '../../utils/mock-type'

export const FreeReturnServiceMockFactory: () => MockType<FreeReturnService> = jest.fn(() => ({
  filterFreeReturns: jest.fn(),
  returnStepsWithReturnType: jest.fn()
}))