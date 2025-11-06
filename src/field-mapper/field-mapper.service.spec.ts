import { JwtUser } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MockType } from '../../test/utils/mock-type'
import { CreateFieldMapperDto } from './dto/create-field-mapper.dto'
import { UpdateFieldMapperDto } from './dto/update-field-mapper.dto'
import { FieldMapper } from './entities/field-mapper.entity'
import { FieldMapperService } from './field-mapper.service'

describe('FieldMapperService', () => {
  let service: FieldMapperService
  let repositoryMock: MockType<Repository<FieldMapper>>
  let userHeaders: JwtUser = { entityId: 1, entityRole: 'partner', implementationIds: '1,2,3,4' }
  const itemResponse = {
    entityType: 'order',
    entityField: 'partnerOrderId',
    wmsValue: 'UPS',
    shopValue: 'UPS_1',
    implementationId: 1,
    id: 1,
    createdAt: "2021-12-23T11:16:17.987Z",
    updatedAt: "2021-12-23T11:16:17.987Z"
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldMapperService,
        EventEmitter2,
        {
          provide: getRepositoryToken(FieldMapper), useFactory: repositoryMockFactory
        }
      ],
    }).compile()

    service = module.get<FieldMapperService>(FieldMapperService)
    repositoryMock = module.get(getRepositoryToken(FieldMapper))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('FieldMapperService Basic GET test cases', () => {

    it('should findOne() the FieldMapper', async () => {
      repositoryMock.findOneOrFail.mockReturnValue(itemResponse)
      expect(service.findOne(itemResponse.id, userHeaders)).resolves.toEqual(itemResponse)
    })
  })

  describe('FieldMapperService Basic CREATE test cases', () => {

    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    const createFieldMapperObj: CreateFieldMapperDto = {
      entityType: 'order',
      entityField: 'partnerOrderId',
      wmsValue: 'UPS',
      shopValue: 'UPS_1',
      implementationId: 1,
      name: 'order-values',
    }
    const createFieldMapperResponse = {
      entityType: 'order',
      entityField: 'partnerOrderId',
      wmsValue: 'UPS',
      shopValue: 'UPS_1',
      implementationId: 1,
      id: 1,
      name: 'order-values',
      createdAt: "2021-12-23T11:16:17.987Z",
      updatedAt: "2021-12-23T11:16:17.987Z"
    }

    it('should create() the FieldMapper', async () => {
      repositoryMock.create.mockReturnValue(createFieldMapperResponse)
      expect(service.create(createFieldMapperObj, userHeaders)).resolves.toEqual(createFieldMapperResponse)
    })
  })

  describe('FieldMapperService Basic UPDATE test cases', () => {

    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    const updateBody: UpdateFieldMapperDto = {
      wmsValue: 'UPS'
    }
    const storageItemId = 1
    it('should update() the FieldMapper', async () => {
      repositoryMock.findOneOrFail.mockReturnValue(itemResponse)
      repositoryMock.update.mockReturnValue({ affected: 1 })
      expect(service.update(storageItemId, updateBody, userHeaders)).resolves
    })
  })

  describe('FieldMapperService Basic DELETE test cases', () => {

    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    const FieldMapperId = 1
    it('should delete() the FieldMapper', async () => {
      repositoryMock.findOneOrFail.mockReturnValue(itemResponse)
      expect(service.remove(FieldMapperId, userHeaders)).resolves
    })
  })
})

const repositoryMockFactory: () => MockType<Repository<FieldMapper>> = jest.fn(() => ({
  create: jest.fn(entity => entity),
  save: jest.fn(entity => entity),
  findOneOrFail: jest.fn(entity => entity),
  find: jest.fn(entity => entity),
  update: jest.fn(entity => entity),
  delete: jest.fn(entity => entity),
  findByFilter: jest.fn(entity => entity),
}))