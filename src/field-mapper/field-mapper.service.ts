import { JwtUser, OrgType, CountQueryTypeEnum, IPaginationOptions, Pagination } from '../core/types/common.types'
// Stub paginate function for demo
const paginate = async (repo: any, options: any, searchOptions?: any) => {
  return { items: [], meta: {}, links: {} }
}
import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityNotFoundError, FindManyOptions, In, Repository } from 'typeorm'
import { AfterSaveEvent } from '../core/interfaces/after-save-event.interface'
import { modifyPaginatorLinks } from '../core/utils/paginator.util'
import {
  attachImplementationIdForFilter,
  checkForUnauthorizedAccess
} from '../core/utils/queryConnector.util'
import { getUserImplementationIds } from '../core/utils/user.utils'
import { CreateFieldMapperDto } from './dto/create-field-mapper.dto'
import { QueryFieldMapperDto } from './dto/query-field-mapper.dto'
import { UpdateFieldMapperDto } from './dto/update-field-mapper.dto'
import { FieldMapper } from './entities/field-mapper.entity'
import { FieldMapperEntityTypesEnum } from './enums/entity-types.enum'
import { FieldMapperValue } from './interfaces/field-mapper-value.interface'

@Injectable()
export class FieldMapperService {
  constructor(
    @InjectRepository(FieldMapper) private FieldMapperRepository: Repository<FieldMapper>,
    private eventEmitter: EventEmitter2
  ) {}

  private async toggleIsDefaultRecords(
    implementationId: number,
    entityType: string,
    entityField: string
  ) {
    try {
      await this.FieldMapperRepository.update(
        {
          implementationId: implementationId,
          entityType: entityType,
          entityField: entityField,
          isDefault: true
        },
        { isDefault: false }
      )
    } catch (err) {
      throw err
    }
  }

  async create(
    createFieldMapperDto: CreateFieldMapperDto,
    userHeaders: JwtUser
  ): Promise<FieldMapper> {
    try {
      await checkForUnauthorizedAccess(userHeaders, createFieldMapperDto.implementationId)
      let createdFieldMapper = this.FieldMapperRepository.create(createFieldMapperDto)

      if (createFieldMapperDto?.isDefault) {
        await this.toggleIsDefaultRecords(
          createFieldMapperDto.implementationId,
          createFieldMapperDto.entityType,
          createFieldMapperDto.entityField
        )
      }

      const fieldMapper = await this.FieldMapperRepository.save(createdFieldMapper)
      this.eventEmitter.emit('field_mapper.after_save', <AfterSaveEvent<FieldMapper>>{
        created: fieldMapper,
        user: userHeaders
      })

      return fieldMapper
    } catch (error) {
      throw error
    }
  }

  async findAll(
    options: IPaginationOptions,
    userHeaders: JwtUser
  ): Promise<Pagination<FieldMapper>> {
    try {
      const paginatedResult = await paginate(
        this.FieldMapperRepository,
        { ...options, countQueryType: CountQueryTypeEnum.ENTITY },
        {
          where: {
            implementationId: In(getUserImplementationIds(userHeaders))
          }
        }
      )
      return modifyPaginatorLinks(paginatedResult)
    } catch (error) {
      throw error
    }
  }

  async findByFilter(
    queryDto: QueryFieldMapperDto,
    options: IPaginationOptions,
    userHeaders?: JwtUser
  ): Promise<Pagination<FieldMapper>> {
    try {
      const { implementationId, ...restQueryDto } = queryDto
      if (implementationId) await checkForUnauthorizedAccess(userHeaders, implementationId)

      const queryObj = this.FieldMapperRepository.createQueryBuilder('t')
        .select()
        .where(restQueryDto)

      attachImplementationIdForFilter(queryObj, userHeaders)

      const paginatedResult = await paginate(queryObj, {
        ...options,
        countQueryType: CountQueryTypeEnum.ENTITY
      })
      return modifyPaginatorLinks(paginatedResult)
    } catch (error) {
      throw error
    }
  }

  async findOne(id: number, userHeaders: JwtUser): Promise<FieldMapper> {
    try {
      let FieldMapperObj = await this.FieldMapperRepository.findOneOrFail({ where: { id } })

      await checkForUnauthorizedAccess(userHeaders, FieldMapperObj.implementationId)

      return FieldMapperObj
    } catch (error) {
      throw error
    }
  }

  async update(id: number, updateDto: UpdateFieldMapperDto, userHeaders: JwtUser): Promise<void> {
    try {
      const fieldMapper = await this.findOne(id, userHeaders)

      if (updateDto.implementationId)
        await checkForUnauthorizedAccess(userHeaders, updateDto.implementationId)
      if (updateDto?.isDefault) {
        await this.toggleIsDefaultRecords(
          fieldMapper.implementationId,
          fieldMapper.entityType,
          fieldMapper.entityField
        )
      }

      const updateResult = await this.FieldMapperRepository.update(id, updateDto)
      if (updateResult.affected === 0) {
        throw new EntityNotFoundError(FieldMapper, `id = ${id}`)
      }

      this.eventEmitter.emit('field_mapper.after_save', <AfterSaveEvent<FieldMapper>>{
        updated: { ...fieldMapper, ...updateDto },
        user: userHeaders
      })
    } catch (error) {
      throw error
    }
  }

  async remove(id: number, userHeaders: JwtUser): Promise<void> {
    try {
      await this.findOne(id, userHeaders)
      await this.FieldMapperRepository.delete(id)
    } catch (error) {
      throw error
    }
  }

  async mapToShopPayload(
    payload: any,
    entityType: FieldMapperEntityTypesEnum,
    FieldMapperRecords?: FieldMapper[],
    implementationId?: number
  ): Promise<any> {
    if (!FieldMapperRecords && (!implementationId || !entityType)) {
      throw new Error('Invalid Params')
    } else if (!FieldMapperRecords) {
      FieldMapperRecords = await this.FieldMapperRepository.find({
        where: { implementationId, entityType }
      })
    }
    return this.modifyPayload(payload, FieldMapperRecords, OrgType.Shop)
  }

  async mapToWmsPayload(
    payload: any,
    entityType: FieldMapperEntityTypesEnum,
    FieldMapperRecords?: FieldMapper[],
    implementationId?: number
  ): Promise<any> {
    if (!FieldMapperRecords && (!implementationId || !entityType)) {
      throw new Error('Invalid Params')
    } else if (!FieldMapperRecords) {
      FieldMapperRecords = await this.FieldMapperRepository.find({
        where: { implementationId, entityType }
      })
    }
    return this.modifyPayload(payload, FieldMapperRecords, OrgType.Wms)
  }

  modifyPayload(payload: any, FieldMapperRecords: FieldMapper[], orgType: OrgType): any {
    this.getConnectionMapObj(FieldMapperRecords, orgType).forEach((key, value) => {
      payload[key] = value
    })
    return payload
  }

  getConnectionMapObj(FieldMapperRecords: FieldMapper[], orgType: OrgType): any {
    let payLoadMap = {}
    if (orgType == OrgType.Shop) {
      FieldMapperRecords.forEach((record) => {
        payLoadMap[record.entityField] = record.shopValue
      })
    } else {
      FieldMapperRecords.forEach((record) => {
        payLoadMap[record.entityField] = record.wmsValue
      })
    }
    return payLoadMap
  }

  async find(options?: FindManyOptions<FieldMapper>): Promise<FieldMapper[]> {
    try {
      return await this.FieldMapperRepository.find(options)
    } catch (error) {
      throw error
    }
  }

  async getValueFromFieldMapper(
    options: FindManyOptions<FieldMapper>,
    filedMapperType: OrgType
  ): Promise<FieldMapperValue> {
    const fieldMappers = await this.FieldMapperRepository.find(options)

    const fieldMapperValue: FieldMapperValue = {
      fieldMappersObj: {},
      defaultFieldMapper: null
    }

    if (!fieldMappers || fieldMappers.length < 1) return fieldMapperValue

    const defaultFieldMapper = fieldMappers.filter((fm) => fm.isDefault)?.[0]

    const actualFieldMappers = fieldMappers.filter((fm) => !fm.isDefault)

    if (filedMapperType == OrgType.Shop) {
      actualFieldMappers.forEach((e) => {
        fieldMapperValue.fieldMappersObj[`${e.implementationId}_${e.wmsValue}`] = e.shopValue
      })
    }

    if (filedMapperType == OrgType.Wms) {
      actualFieldMappers.forEach((e) => {
        fieldMapperValue.fieldMappersObj[`${e.implementationId}_${e.shopValue}`] = e.wmsValue
      })
    }

    fieldMapperValue.defaultFieldMapper = defaultFieldMapper

    return fieldMapperValue
  }
}
