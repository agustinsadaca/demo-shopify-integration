import { of } from 'rxjs'
import { ImplementationsService } from '../../../src/implementations/implementations.service'
import findOneImplementationDummy from '../../dummies/common/implementation/find-one-implementation.json'
import { MockType } from '../../utils/mock-type'

export const ImplementationServiceMockFactory: () => MockType<ImplementationsService> = jest.fn(() => ({
  filterImplementations: jest.fn(() => { return of([]) }),
  getImplementation: jest.fn(() => { return of(findOneImplementationDummy) }),
}))