import { JwtUser } from '../core/types/common.types'
import { CreateInventoryLevelSourceDto } from './dtos/create-inventory-level-source.dto'
import { QueryInventoryLevelSourceDto } from './dtos/query-inventory-level-source.dto'
import { QuantitiesBySkuImplementationsDto } from './dtos/quantities-by-sku-implementations.dto'
// Entity and type aliases
type InventoryLevelSource = any
type InventoryLevelType = any
type InventoryLevelTypeSkuImplementation = any
import { Injectable, Logger } from '@nestjs/common'
import { lastValueFrom, of,Observable } from 'rxjs'
import { PaginatedResult } from '../core/interfaces/pagination-result.interface'

@Injectable()
export class InventoryLevelSourceService {
  private readonly logger = new Logger(InventoryLevelSourceService.name)

  constructor() { }

  filterInventoryLevelSources(queryInventoryLevelSourceDto: QueryInventoryLevelSourceDto, user: JwtUser): Observable<PaginatedResult<InventoryLevelSource>> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getInventoryLevelSource(id: number, user: JwtUser): Observable<InventoryLevelSource> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  createInventoryLevelSource(createInventoryLevelSourceDto: CreateInventoryLevelSourceDto, user: JwtUser): Observable<InventoryLevelSource> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getInventoryLevelQuantities(sku: string, user: JwtUser): Observable<InventoryLevelType[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getInventoryLevelQuantitiesBySkuImplementations(quantitiesBySkuImplementationsDto: QuantitiesBySkuImplementationsDto, user: JwtUser): Observable<InventoryLevelTypeSkuImplementation[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  async bulkCreateInventoryLevelSource(createInventoryLevelSourceDtoList: CreateInventoryLevelSourceDto[], user: JwtUser): Promise<void> {
    try {
      for (let createInventoryLevelSourceDto of createInventoryLevelSourceDtoList) {
        await lastValueFrom(this.createInventoryLevelSource(createInventoryLevelSourceDto, user))
      }
      return Promise.resolve()
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }
}
