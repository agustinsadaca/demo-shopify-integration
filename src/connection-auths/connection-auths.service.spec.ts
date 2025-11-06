import { OrgType, TargetSystemEnum } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RepositoryMockFactory } from '../../test/mocks/common/repository.mock'
import { MockType } from '../../test/utils/mock-type'
import { HttpShopifyService } from '../shop-connectors/shopify/http-shopify.service'
import { ConnectionAuthsService } from './connection-auths.service'
import { CreateConnectionAuthDto } from './dtos/create-connection-auth.dto'
import { UpdateConnectionAuthDto } from './dtos/update-connection-auth.dto'
import { ConnectionAuth } from './entities/connection-auth.entity'
import { Encryption } from './utils/encryption-util'
import { JwtUser } from '../core/types/common.types'
import { Role } from 'src/shop-connectors/shopify/entities'
describe('ConnectionAuthsService', () => {
  let service: ConnectionAuthsService
  let repositoryMock: MockType<Repository<ConnectionAuth>>
  let createConnectionAuthDto: CreateConnectionAuthDto
  let connectionAuth: ConnectionAuth
  let encryption: Encryption

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionAuthsService,
        {
          provide: getRepositoryToken(ConnectionAuth),
          useFactory: RepositoryMockFactory
        },
        {
          provide: HttpShopifyService,
          useFactory: httpShopifyService
        },
        Encryption
      ]
    }).compile()

    repositoryMock = module.get(getRepositoryToken(ConnectionAuth))
    service = module.get<ConnectionAuthsService>(ConnectionAuthsService)
    encryption = module.get<Encryption>(Encryption)
    createConnectionAuthDto = {
      implementationId: 1,
      connectionUrl: 'https://shop_owner.myshopify.com',
      authObject: { accessKey: 'access_key_hash', secretKey: 'secret_key_hash' },
      authStrategy: 'Basic Auth',
      isActive: true,
      targetSystem: TargetSystemEnum.SHOPIFY,
      targetType: OrgType.Shop,
      targetTypeId: 1,
      defaultTimezone: '+05:45',
      delayOrderReleaseInMinutes: 5
    }
    connectionAuth = {
      createdAt: new Date(),
      updatedAt: new Date(),
      targetSyncs: null,
      id: 1,
      ...createConnectionAuthDto
    }
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should fetch config data for implementationId using function findByImplementationId', () => {
    repositoryMock.findOneOrFail.mockReturnValue(connectionAuth)
    expect(service.findByImplementationId(connectionAuth.implementationId)).resolves.toEqual(
      connectionAuth
    )
  })

  it('should be possible to create a ConnectionAuth', async () => {
    const newConnectionAuth = {
      ...createConnectionAuthDto
    }
    repositoryMock.create.mockReturnValue(createConnectionAuthDto)
    repositoryMock.findOne.mockReturnValue(null)
    repositoryMock.save.mockReturnValue([newConnectionAuth])

    const user: JwtUser = {
      entityId: 1,
      entityRole: Role.Admin,
      implementationIds: '1'
    }

    expect(await service.create(createConnectionAuthDto, user)).toEqual([newConnectionAuth])
    expect(repositoryMock.create).toHaveBeenCalledWith(createConnectionAuthDto)
    expect(repositoryMock.save).toHaveBeenCalledWith(newConnectionAuth)
  })

  it('should throw error if metaInfo is not equivalent to subClientId', async () => {
    const newConnectionAuth: ConnectionAuth = {
      ...(createConnectionAuthDto as ConnectionAuth),
      metaInfo: {
        subClientInfo: {
          '3': 'CO101',
          '4': 'CO102'
        }
      },
      sharedImplementations: [3, 4],
      targetSystem: TargetSystemEnum.SIGLOCH,
      authObject: {
        host: 'localhost',
        password: 'test',
        username: 'test',
        basePath: 'test',
        port: '9000',
        idleTimeout: '5'
      }
    }
    repositoryMock.create.mockReturnValue(newConnectionAuth)
    repositoryMock.save.mockReturnValue([newConnectionAuth])

    const user = {
      entityId: 1,
      entityRole: 'admin',
      implementationIds: '1'
    }

    await expect(service.create(newConnectionAuth, user)).rejects.toThrow()
  })

  it('should fetch connection auth data for id using function findOne', async () => {
    const connectionAuthId: number = 1
    const user: JwtUser = {
      entityId: 1,
      entityRole: 'admin',
      implementationIds: '1'
    }

    const setEncryptSpy = jest.spyOn(encryption, 'decryptConnectionAuth').mockImplementation()
    jest.spyOn(repositoryMock, 'findOneOrFail').mockImplementation(() => {
      return connectionAuth
    })
    const connAuth = await service.findOne(connectionAuthId, user)
    expect(setEncryptSpy).toHaveBeenCalledWith(connectionAuth)
    expect(connAuth).toEqual(connectionAuth)
  })

  it('should be possible to update an customer', async () => {
    const id: number = 1
    const updateConnectionAuthDto: UpdateConnectionAuthDto = {
      implementationId: 2,
      connectionUrl: 'https://shop_owner.myshopify.com',
      authObject: {
        accessKey: 'access_key_hash',
        secretKey: 'secret_key_hash',
        apiKey: 'api_key_hash'
      },
      authStrategy: 'Basic Auth',
      isActive: true,
      targetSystem: TargetSystemEnum.BILLBEE,
      targetType: OrgType.Wms,
      targetTypeId: 1,
      defaultTimezone: '+05:30'
    }

    const user = {
      entityId: 1,
      entityRole: 'admin',
      implementationIds: '1'
    }

    repositoryMock.findOneOrFail.mockReturnValue(connectionAuth)
    await service.update(id, updateConnectionAuthDto, user)
    expect(repositoryMock.update).toHaveBeenCalledWith(+id, updateConnectionAuthDto)
  })
})

const httpShopifyService: () => MockType<HttpShopifyService> = jest.fn()
