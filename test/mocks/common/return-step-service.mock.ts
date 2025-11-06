import { CreateReturnStepsDto, JwtUser, QueryReturnStepsDto, UpdateReturnStepsDto } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { of } from 'rxjs'
import { ReturnStepsService } from '../../../src/return-steps/return-steps.service'
import { MockType } from '../../utils/mock-type'

export const ReturnStepsServiceMockFactory: () => MockType<ReturnStepsService> = jest.fn(() => ({
  createReturnSteps: jest.fn((createReturnStepsDto: CreateReturnStepsDto, user: JwtUser) => { return of() }),
  filterReturnSteps: jest.fn((queryReturnStepsDto: QueryReturnStepsDto, user: JwtUser) => { return of({}) }),
  getReturnSteps: jest.fn((id: number, user: JwtUser) => { return of() }),
  updateReturnSteps: jest.fn((id: number, updateReturnStepsDto: UpdateReturnStepsDto, user: JwtUser) => { return of() }),
}))