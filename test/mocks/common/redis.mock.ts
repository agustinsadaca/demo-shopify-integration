import { RedisClientType } from 'redis'
import { MockType } from '../../utils/mock-type'

export const RedisClientMockFactory: () => MockType<RedisClientType> = jest.fn(() => ({
  GET: jest.fn(() => { return Promise.resolve() }),
  get: jest.fn(() => { return Promise.resolve() }),
  SET: jest.fn(() => { return Promise.resolve() }),
  set: jest.fn(() => { return Promise.resolve() }),
}))