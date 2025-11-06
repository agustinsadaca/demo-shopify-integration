import { OrgType, TargetSystemEnum } from '../shop-connectors/shopify/entities/enums.entity'
import { JwtUser, CountQueryTypeEnum, IPaginationOptions, Pagination, PaginationTypeEnum, paginate } from '../core/types/common.types'
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { isNumber } from 'class-validator'
import _ from 'lodash'
import { lastValueFrom } from 'rxjs'
import { EntityNotFoundError, Repository } from 'typeorm'
import { mainConfigs } from '../config/config'
import { ConnectionAuth } from '../connection-auths/entities/connection-auth.entity'
import { ConnectionAuthMetaInfo } from '../core/interfaces/connection-auth-meta-info.interface'
import { isEmpty } from '../core/utils/is-empty.utils'
import { checkPaginatorLinks } from '../core/utils/paginator.util'
import {
  attachImplementationIdForFilter,
  checkForUnauthorizedAccess
} from '../core/utils/queryConnector.util'
import { HttpShopifyService } from '../shop-connectors/shopify/http-shopify.service'

import { CreateConnectionAuthDto } from './dtos/create-connection-auth.dto'
import { QueryConnectionAuthsDto } from './dtos/query-connection-auths.dto'
import { UpdateConnectionAuthDto } from './dtos/update-connection-auth.dto'
import { TestConnectionResponseInterface } from './interface/test-connection-response.interface'
import {
  BillbeeAuth,
  CommonAuthWithAccessKey,
  CommonAuthWithUserNamePassword,
  DHLFNNAuth,
  JtlAuth,
  ShopifyAccessTokenAuth,
  ShopwareAuth
} from './utils/auth-object.utils'
import { Encryption } from './utils/encryption-util'

@Injectable()
export class ConnectionAuthsService {
  private readonly logger = new Logger(ConnectionAuthsService.name)

  constructor(
    @InjectRepository(ConnectionAuth) private connectionRepository: Repository<ConnectionAuth>,

   

    @Inject(forwardRef(() => HttpShopifyService))
    private shopifyApi: HttpShopifyService,



    private encryption: Encryption
  ) {}

  private validateAuthObject(authObject: object, authObjectKeys: string[]): void {
    authObjectKeys.forEach((key) => {
      const isInvalidAuthObject = !authObject.hasOwnProperty(key) || !authObject[key]
      if (isInvalidAuthObject) throw new BadRequestException(`Invalid auth object provided.`)
    })
  }

  private checkAuthObject(targetSystem: string, authObject: object, authStrategy: string): void {
    switch (targetSystem) {
      case TargetSystemEnum.BILLBEE:
        this.validateAuthObject(authObject, BillbeeAuth)
        break

      case TargetSystemEnum.SHOPIFY:
      case TargetSystemEnum.WOOCOMMERCE:
        this.validateAuthObject(
          authObject,
          authStrategy === 'auth-token' ? ShopifyAccessTokenAuth : CommonAuthWithAccessKey
        )
        break

      case TargetSystemEnum.XENTRAL:
      case TargetSystemEnum.TM3:
      case TargetSystemEnum.SIGLOCH:
        this.validateAuthObject(authObject, CommonAuthWithUserNamePassword)
        break

      case TargetSystemEnum.JTL:
        this.validateAuthObject(authObject, JtlAuth)
        break
      case TargetSystemEnum.SHOPWARE:
        this.validateAuthObject(authObject, ShopwareAuth)
        break
      case TargetSystemEnum.DHL_FFN:
        this.validateAuthObject(authObject, DHLFNNAuth)
        break
      default:
        throw new BadRequestException(`no matching case found for targetSystem: ${targetSystem}`)
    }
  }

  private checkTargetSystemAndAuthObject(
    updateConnectionAuthDto: UpdateConnectionAuthDto,
    previousConnectionAuthObj: ConnectionAuth
  ) {
    try {
      const isTargetSystemOrAuthObjectUpdated =
        typeof updateConnectionAuthDto.targetSystem !== undefined ||
        typeof updateConnectionAuthDto.authObject !== undefined

      if (!isTargetSystemOrAuthObjectUpdated) return

      const targetSystem: string =
        updateConnectionAuthDto.targetSystem ?? previousConnectionAuthObj.targetSystem
      const authObject: object =
        updateConnectionAuthDto.authObject ?? previousConnectionAuthObj.authObject
      const authStrategy: string =
        updateConnectionAuthDto.authStrategy ?? previousConnectionAuthObj.authStrategy

      this.checkAuthObject(targetSystem, authObject, authStrategy)
    } catch (e) {
      throw e
    }
  }

  private async checkSftpRecords(authStrategy: string, authObject: object, id?: number) {
    const isSftp = authStrategy && authStrategy.includes('sftp')
    if (isSftp) {
      const queryObj = this.connectionRepository
        .createQueryBuilder('connection')
        .select()
        .where('connection.auth_object ::jsonb @> :authObject', {
          authObject: JSON.stringify({
            host: authObject['host'],
            port: authObject['port'],
            username: authObject['username']
          })
        })

      if (id) {
        queryObj.andWhere('connection.id != :id', { id })
      }

      const connectionAuthAlreadyExists = await queryObj.getOne()
      if (connectionAuthAlreadyExists) {
        throw new BadRequestException(`Same record already exists.`)
      }
    }
  }

  private validateSubClientId(
    targetSystem: TargetSystemEnum,
    sharedImplementations,
    metaInfo: ConnectionAuthMetaInfo
  ) {
    if (!sharedImplementations?.length && !metaInfo) {
      throw new BadRequestException(`subClientInfo and metaInfo for ${targetSystem} is required`)
    }

    if (
      !sharedImplementations ||
      !metaInfo?.subClientInfo ||
      Object.keys(metaInfo?.subClientInfo).length !== sharedImplementations.length
    ) {
      throw new BadRequestException(`subClientInfo in metaInfo for ${targetSystem} is required`)
    }
  }

  private validateJTLMetaInfo(targetSystem: TargetSystemEnum, metaInfo: ConnectionAuthMetaInfo) {
    if (!metaInfo?.fulfillerId || !metaInfo?.warehouseId) {
      throw new BadRequestException(
        `fulfillerId and warehouseId in metaInfo for ${targetSystem} is required`
      )
    }
  }

  private validateShopwareMetaInfo(createConnectionAuthDto: CreateConnectionAuthDto) {
    if (!createConnectionAuthDto.metaInfo) createConnectionAuthDto.metaInfo = {}
    if (!createConnectionAuthDto.metaInfo?.order) {
      createConnectionAuthDto.metaInfo.order = { lastSyncedOrderNumber: '0' }
    }
  }

  private checkMetaInfo(createConnectionAuthDto: CreateConnectionAuthDto): void {
    const { targetSystem, sharedImplementations, metaInfo } = createConnectionAuthDto
    switch (targetSystem) {
      case TargetSystemEnum.SIGLOCH:
        this.validateSubClientId(targetSystem, sharedImplementations, metaInfo)
        break
      case TargetSystemEnum.JTL:
        this.validateJTLMetaInfo(targetSystem, metaInfo)
        break
      case TargetSystemEnum.SHOPWARE:
        this.validateShopwareMetaInfo(createConnectionAuthDto)
        break
      default:
    }
  }

  private async checkConnectionForShop(
    connectionAuth: ConnectionAuth,
    shopApi
  ): Promise<TestConnectionResponseInterface> {
    try {
      const data = { query: { limit: 1 } }
      await lastValueFrom(await shopApi.getOrderList(connectionAuth, data))
      return { success: true }
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST)
    }
  }

  private async connectionTestForTargetSystem(
    connectionAuth: ConnectionAuth
  ): Promise<TestConnectionResponseInterface> {
    const { targetSystem } = connectionAuth
    switch (targetSystem) {

      case TargetSystemEnum.SHOPIFY:
        return this.checkConnectionForShop(connectionAuth, this.shopifyApi)


      default:
        throw new HttpException('Target System not supported for now.', 400)
    }
  }

  async testConnection(connAuthId: number): Promise<TestConnectionResponseInterface> {
    try {
      let connectionAuth
      try {
        connectionAuth = await this.connectionRepository.findOneByOrFail({ id: connAuthId })
      } catch (err) {
        throw new NotFoundException(
          `Couldn't find the Connection-Auth Record with id: ${connAuthId}`
        )
      }
      this.encryption.decryptConnectionAuth(connectionAuth)
      return await this.connectionTestForTargetSystem(connectionAuth)
    } catch (err) {
      throw err
    }
  }

  private addImplementationIdInSharedImplementationsIfNotExists(
    targetSystem: TargetSystemEnum,
    implementationId: number,
    sharedImplementations: number[],
    oldImplementationId?: number
  ) {
    try {
      if (targetSystem !== TargetSystemEnum.SIGLOCH) return sharedImplementations

      let newSharedImplementations = []

      if (sharedImplementations) newSharedImplementations = [...sharedImplementations]

      if (!newSharedImplementations.includes(implementationId))
        newSharedImplementations = [...newSharedImplementations, implementationId]

      if (!oldImplementationId) return newSharedImplementations

      const index = newSharedImplementations.findIndex((id) => id === oldImplementationId)
      if (index < 0) return newSharedImplementations
      newSharedImplementations.splice(index, 1)

      return newSharedImplementations
    } catch (error) {
      throw error
    }
  }

  setupDefaultMetaInfo(createConnectionAuthDto: CreateConnectionAuthDto) {
    const { targetSystem } = createConnectionAuthDto
    const defaultMetaInfo = {
      billbee: { order: { filter: { State: 3 }, lastSyncedCustomerOrderId: '1' } }
    }

    switch (targetSystem) {
      case TargetSystemEnum.BILLBEE:
        const metaInfo = _.merge(defaultMetaInfo.billbee, createConnectionAuthDto.metaInfo || {})
        createConnectionAuthDto.metaInfo = metaInfo
        break
      default:
        break
    }
  }

  async create(
    createConnectionAuthDto: CreateConnectionAuthDto,
    userHeaders: JwtUser
  ): Promise<ConnectionAuth> {
    try {
      await this.authorizeImplementationIds(
        createConnectionAuthDto.implementationId,
        createConnectionAuthDto.sharedImplementations,
        userHeaders
      )

      const existingConnectionAuth = await this.connectionRepository.findOne({
        where: {
          implementationId: createConnectionAuthDto.implementationId,
          targetType: createConnectionAuthDto.targetType
        }
      })

      if (existingConnectionAuth !== null) {
        throw new ConflictException(
          `Connection Auth already exists for implementationId: ${existingConnectionAuth.implementationId}, with targetType: ${existingConnectionAuth.targetType}, targetSystem: ${existingConnectionAuth.targetSystem}`
        )
      }

      this.checkAuthObject(
        createConnectionAuthDto.targetSystem,
        createConnectionAuthDto.authObject,
        createConnectionAuthDto.authStrategy
      )
      createConnectionAuthDto.sharedImplementations =
        this.addImplementationIdInSharedImplementationsIfNotExists(
          createConnectionAuthDto.targetSystem,
          createConnectionAuthDto.implementationId,
          createConnectionAuthDto.sharedImplementations
        )

      await this.checkSftpRecords(
        createConnectionAuthDto.authStrategy,
        createConnectionAuthDto.authObject
      )

      this.checkMetaInfo(createConnectionAuthDto)
      this.setupDefaultMetaInfo(createConnectionAuthDto)
      this.setupDefaultDelayOrderRelease(createConnectionAuthDto)
      this.encryption.encryptConnectionAuth(createConnectionAuthDto)

      const connectionAuth = this.connectionRepository.create(createConnectionAuthDto)
      return await this.connectionRepository.save(connectionAuth)
    } catch (e) {
      throw e
    }
  }

  private async authorizeImplementationIds(
    implementationId: number,
    sharedImplementations: number[],
    userHeaders: JwtUser
  ) {
    try {
      if (sharedImplementations && sharedImplementations.length == 0)
        throw new BadRequestException('sharedImplementations cannot be an empty array')

      let implementationIds = []
      if (implementationId) implementationIds.push(implementationId)

      if (sharedImplementations && sharedImplementations.length > 0)
        implementationIds = [...implementationIds, ...sharedImplementations]

      await checkForUnauthorizedAccess(userHeaders, implementationIds)
    } catch (e) {
      throw e
    }
  }

  async findAll(): Promise<ConnectionAuth[]> {
    try {
      return await this.connectionRepository.find()
    } catch (e) {
      throw new BadRequestException(`Could not find any entity`)
    }
  }

  async findByFilter(
    queryDto: QueryConnectionAuthsDto,
    options: IPaginationOptions,
    userHeaders: JwtUser
  ): Promise<Pagination<ConnectionAuth>> {
    try {
      const { implementationId, sharedImplementations, ...restQueryDto } = queryDto
      if (implementationId) await checkForUnauthorizedAccess(userHeaders, implementationId)

      const queryObj = this.connectionRepository
        .createQueryBuilder('connection')
        .select()
        .where({ ...restQueryDto })

      attachImplementationIdForFilter(queryObj, userHeaders)

      if (sharedImplementations) {
        let sharedImps = []
        if (Array.isArray(sharedImplementations)) {
          sharedImps = sharedImplementations.map(
            (implementationId) => isNumber(implementationId) && implementationId
          )
        } else {
          sharedImps = isNumber(sharedImplementations) && [sharedImplementations]
        }
        queryObj.andWhere(`connection.shared_implementations @> '{${sharedImps.toString()}}'`)
      }

      const paginatedResult = await paginate<ConnectionAuth>(queryObj, {
        ...options,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
        countQueryType: CountQueryTypeEnum.ENTITY
      })
      this.encryption.decryptConnectionAuth(paginatedResult)
      return checkPaginatorLinks(paginatedResult)
    } catch (e) {
      throw e
    }
  }

  async findOne(id: number, userHeaders: JwtUser): Promise<ConnectionAuth> {
    try {
      let connectionAuth: ConnectionAuth
      try {
        connectionAuth = await this.connectionRepository.findOneOrFail({ where: { id } })
      } catch (e) {
        throw new HttpException(`Could not find any entity with id: ${id}`, 404)
      }

      await checkForUnauthorizedAccess(userHeaders, connectionAuth.implementationId)
      this.encryption.decryptConnectionAuth(connectionAuth)
      return connectionAuth
    } catch (e) {
      throw new BadRequestException(`Could not find any entity with id: ${id}`)
    }
  }

  async update(
    id: number,
    updateConnectionAuthDto: UpdateConnectionAuthDto,
    userHeaders?: JwtUser
  ) {
    try {
      let previousConnectionAuthObj: ConnectionAuth
      try {
        previousConnectionAuthObj = await this.findOne(id, userHeaders)
      } catch (e) {
        throw new NotFoundException()
      }

      await this.authorizeImplementationIds(
        updateConnectionAuthDto.implementationId || previousConnectionAuthObj.implementationId,
        updateConnectionAuthDto.sharedImplementations,
        userHeaders
      )

      this.checkTargetSystemAndAuthObject(updateConnectionAuthDto, previousConnectionAuthObj)
      const authStrategy =
          updateConnectionAuthDto.authStrategy || previousConnectionAuthObj.authStrategy,
        authObject = updateConnectionAuthDto.authObject || previousConnectionAuthObj.authObject

      const { implementationId, sharedImplementations } = updateConnectionAuthDto
      const targetSystem =
        updateConnectionAuthDto.targetSystem || previousConnectionAuthObj.targetSystem
      if (sharedImplementations)
        updateConnectionAuthDto.sharedImplementations =
          this.addImplementationIdInSharedImplementationsIfNotExists(
            targetSystem,
            previousConnectionAuthObj.implementationId,
            sharedImplementations
          )
      if (implementationId)
        updateConnectionAuthDto.sharedImplementations =
          this.addImplementationIdInSharedImplementationsIfNotExists(
            targetSystem,
            implementationId,
            previousConnectionAuthObj.sharedImplementations,
            previousConnectionAuthObj.implementationId
          )
      if (sharedImplementations && implementationId)
        updateConnectionAuthDto.sharedImplementations =
          this.addImplementationIdInSharedImplementationsIfNotExists(
            targetSystem,
            implementationId,
            sharedImplementations,
            previousConnectionAuthObj.implementationId
          )

      updateConnectionAuthDto.targetType =
        updateConnectionAuthDto.targetType || previousConnectionAuthObj.targetType

      await this.checkSftpRecords(authStrategy, authObject, id)
      this.encryption.encryptConnectionAuth(updateConnectionAuthDto)
      return await this.connectionRepository.update(id, updateConnectionAuthDto)
    } catch (e) {
      throw e
    }
  }

  remove(id: number) {
    return `This action removes a #${id} connection`
  }

  async findByImplementationId(implementationId: number): Promise<ConnectionAuth> {
    try {
      const connectionAuth = await this.connectionRepository.findOneOrFail({
        where: { implementationId: implementationId }
      })

      this.encryption.decryptConnectionAuth(connectionAuth)
      return connectionAuth
    } catch (e) {
      throw new BadRequestException(
        `Could not find any entity with implementationId: ${implementationId}`
      )
    }
  }

  async findByImplementationIdAndTargetType(
    implementationId: number,
    targetType: string
  ): Promise<ConnectionAuth> {
    try {
      const connectionAuth = await this.connectionRepository
        .createQueryBuilder('connection')
        .where(
          `connection.is_active = TRUE AND connection.target_type = :targetType AND (connection.implementation_id = :implementationId OR connection.shared_implementations @> '{${implementationId}}')`,
          {
            targetType,
            implementationId
          }
        )
        .getOneOrFail()

      this.encryption.decryptConnectionAuth(connectionAuth)
      return connectionAuth
    } catch (e) {
      throw new BadRequestException(
        `Could not find any entity with implementationId: ${implementationId} and targetType: ${targetType}`
      )
    }
  }

  async getConnectionPool<T extends OrgType>(
    message: { implementationId: number; target: T } | { implementationId: number; targetTypeId?: number }
  ): Promise<ConnectionAuth> {
    const target = 'target' in message ? message.target : OrgType.Shop
    return this.findByImplementationIdAndTargetType(message.implementationId, target as string)
  }

  async findForChangeableTimestamp(implementationId: number): Promise<ConnectionAuth> {
    try {
      const connectionAuth = await this.connectionRepository
        .createQueryBuilder('connection')
        .where(
          `connection.is_active = TRUE AND connection.target_type IN (:...targetType) AND (connection.implementation_id = :implementationId)`,
          {
            targetType: [OrgType.Shop],
            implementationId
          }
        )
        .getOneOrFail()

      this.encryption.decryptConnectionAuth(connectionAuth)
      return connectionAuth
    } catch (e) {
      throw new BadRequestException(
        `Could not find any entity with implementationId: ${implementationId}`
      )
    }
  }

  async findByTargetType(targetType: OrgType): Promise<ConnectionAuth[]> {
    try {
      const connectionAuths = await this.connectionRepository.find({
        where: {
          targetType: targetType,
          isActive: true
        }
      })
      const connectionAuthList = { items: connectionAuths }

      this.encryption.decryptConnectionAuth(connectionAuthList)
      return connectionAuthList.items
    } catch (e) {
      const errorMessage = e?.message
        ? e.message
        : `Could not find any entity with targetType: ${targetType}`
      throw new BadRequestException(errorMessage, e?.stack)
    }
  }

  async findByTargetTypes(targetType: OrgType[]): Promise<ConnectionAuth[]> {
    try {
      if (!Array.isArray(targetType) || !targetType?.length) {
        return Promise.resolve([])
      }

      const connectionAuthQueryBuilder = this.connectionRepository
        .createQueryBuilder('connection')
        .where(`connection.is_active = TRUE AND connection.target_type IN (:...targetType)`, {
          targetType
        })

      const connectionAuths = await connectionAuthQueryBuilder.getMany()

      if (!connectionAuths?.length) {
        throw new EntityNotFoundError(ConnectionAuth, `targetType = ${targetType.toString()}`)
      }

      const authItems = { items: [] }
      connectionAuths.forEach((connectionAuth) => {
        authItems.items.push(connectionAuth)
      })

      this.encryption.decryptConnectionAuth(authItems)

      return authItems.items
    } catch (e) {
      const errorMessage = e?.message
        ? e.message
        : `Could not find any entity with targetType: ${targetType.toString()}`
      throw new BadRequestException(errorMessage, e?.stack)
    }
  }

  async findByTargetTypeAndTargetSystem(
    targetType: OrgType,
    targetSystem: TargetSystemEnum
  ): Promise<ConnectionAuth[]> {
    try {
      const connectionAuths = await this.connectionRepository.find({
        where: {
          targetType: targetType,
          targetSystem: targetSystem,
          isActive: true
        }
      })

      const connectionAuthList = { items: connectionAuths }
      this.encryption.decryptConnectionAuth(connectionAuthList)
      return connectionAuthList.items
    } catch (e) {
      const errorMessage = e?.message
        ? e.message
        : `Could not find any entity with targetType: ${targetType} and targetSystem: ${targetSystem}`
      throw new BadRequestException(errorMessage, e?.stack)
    }
  }

  async findByFacilityAndCustomerId(
    facilityId: string,
    customerId: string
  ): Promise<ConnectionAuth> {
    const connectionAuth = await this.connectionRepository.findOne({
      where: {
        metaInfo: {
          facilityId,
          customerId
        }
      }
    })

    if (!connectionAuth) {
      this.logger.error(
        `Could not find any entity with facilityId: ${facilityId} and customerId: ${customerId}`
      )
      throw new BadRequestException(
        `Could not find any entity with facilityId: ${facilityId} and customerId: ${customerId}`
      )
    }

    return connectionAuth
  }

  private setupDefaultDelayOrderRelease(createConnectionAuthDto: CreateConnectionAuthDto) {
    if (
      createConnectionAuthDto.targetType === OrgType.Shop &&
      isEmpty(createConnectionAuthDto.delayOrderReleaseInMinutes)
    ) {
      createConnectionAuthDto.delayOrderReleaseInMinutes =
        mainConfigs.defaultDelayOrderReleaseInMinutes
    }
  }
}
