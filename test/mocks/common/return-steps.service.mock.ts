import { of } from 'rxjs'
import { ReturnStepsService } from '../../../src/return-steps/return-steps.service'
import { MockType } from '../../utils/mock-type'

export const ReturnStepsServiceMockFactory: () => MockType<ReturnStepsService> = jest.fn(() => ({
  filterReturnSteps: jest.fn(() => { return of([]) }),
}))