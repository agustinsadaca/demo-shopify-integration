import { ConnectionAuthsService } from '../../../src/connection-auths/connection-auths.service'
import { MockType } from '../../utils/mock-type'

export const ConnectionAuthsServiceMockFactory: () => MockType<ConnectionAuthsService> = jest.fn(() => ({
  create: jest.fn(entity => entity),
  findOne: jest.fn(entity => entity),
  findAll: jest.fn(entity => [entity]),
  update: jest.fn(entity => entity),
  remove: jest.fn(entity => entity),
  findByFilter: jest.fn(entity => entity),
  findForChangeableTimestamp: jest.fn(entity => entity)
}))

