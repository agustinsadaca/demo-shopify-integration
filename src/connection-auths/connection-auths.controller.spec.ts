import { Test, TestingModule } from '@nestjs/testing'
import { MockType } from '../../test/utils/mock-type'
import { ConnectionAuthsController } from './connection-auths.controller'
import { ConnectionAuthsService } from './connection-auths.service'

describe('ConnectionAuthsController', () => {
  let controller: ConnectionAuthsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionAuthsController],
      providers: [{
        provide: ConnectionAuthsService, useFactory: serviceMockFactory
      }],
    }).compile()

    controller = module.get<ConnectionAuthsController>(ConnectionAuthsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

const serviceMockFactory: () => MockType<ConnectionAuthsService> = jest.fn(() => ({
  create: jest.fn(entity => entity),
  findOne: jest.fn(entity => entity),
  findAll: jest.fn(entity => [entity]),
  update: jest.fn(entity => entity),
  remove: jest.fn(entity => entity),
  findByFilter: jest.fn(entity => entity)
}))