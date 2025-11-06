import { JwtUser } from '../core/types/common.types'
import { AggregateByStatusInventoryItemDto } from './dtos/aggregate-by-status-inventory-item.dto'
import { CreateInventoryItemDto } from './dtos/create-inventory-item.dto'
import { PutInventoryItemGidDto } from './dtos/put-inventory-item-gid.dto'
import { QueryInventoryByPartnerItemIdsDto } from './dtos/query-inventory-items-by-partner-item-ids.dto'
import { QueryInventoryItemDto } from './dtos/query-inventory-items.dto'
import { UpdateInventoryItemActiveStatusDto } from './dtos/update-inventory-item-active-status.dto'
import { UpdateInventoryItemDto } from './dtos/update-inventory-item.dto'
import { UpdateReturnPeriodDto } from './dtos/update-return-period.dto'
// Entity and type aliases
type InventoryItem = any
type InventoryItemsAggregatedByStatusResponse = any
type ReturnPeriodsResponse = any
type CreatePartnerLocationInventoryItemDto = any
type UpdatePartnerLocationInventoryItemDto = any
import { Injectable } from '@nestjs/common'
import { of, Observable } from 'rxjs'
import { PaginatedResult } from '../core/interfaces/pagination-result.interface'

@Injectable()
export class InventoryItemsService {
  constructor() {}

  getInventoryItemsCountAggregatedByStatus(
    aggregateByStatusInventoryItemDto: AggregateByStatusInventoryItemDto,
    user: JwtUser
  ): Observable<InventoryItemsAggregatedByStatusResponse> {
    return of({} as any)
  }

  getLowStockInventoryItems(hours: number, user: JwtUser): Observable<InventoryItem[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  filterInventoryItems(
    queryInventoryItemDto: QueryInventoryItemDto,
    user: JwtUser
  ): Observable<PaginatedResult<InventoryItem>> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  filterInventoryItemsUsingList(
    skuImplementationList: string[],
    user: JwtUser
  ): Observable<InventoryItem[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getInventoryItem(id: number, user: JwtUser): Observable<InventoryItem> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  createInventoryItem(
    createInventoryItemDto: CreateInventoryItemDto,
    user: JwtUser
  ): Observable<InventoryItem> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  updateInventoryItem(
    id: number,
    updateInventoryItemDto: UpdateInventoryItemDto,
    isInternalUpdate: boolean,
    user: JwtUser
  ): Observable<InventoryItem> {
    return of({} as any)
  }

  updateReturnPeriod(
    implementationId: number,
    updateReturnPeriodDto: UpdateReturnPeriodDto,
    user: JwtUser
  ): Observable<any> {
    return of({} as any)
  }

  getReturnPeriod(implementationId: number, user: JwtUser): Observable<ReturnPeriodsResponse> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  updateOrCreateInventoryItems(
    inventoryItemList: CreateInventoryItemDto[] | UpdateInventoryItemDto[],
    isInternalUpdate: boolean,
    partnerLocationInventoryItemList:
      | CreatePartnerLocationInventoryItemDto[]
      | UpdatePartnerLocationInventoryItemDto[],
    user: JwtUser
  ): Observable<InventoryItem[]> {
    return of([] as any)
  }

  filterInventoryItemsNotContainGID(
    implementationId: number,
    user: JwtUser
  ): Observable<InventoryItem[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  putInventoryItemsGID(
    productVariantsMetaInfo: PutInventoryItemGidDto[],
    user: JwtUser
  ): Observable<InventoryItem[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  bulkUpdateInventoryItems(
    updateDtoList: UpdateInventoryItemDto[],
    isInternalUpdate: boolean,
    user: JwtUser
  ): Observable<any> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  updateInventoryItemActiveStatus(
    data: UpdateInventoryItemActiveStatusDto,
    id: number,
    user: JwtUser
  ): Observable<any> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  filterByPartnerItemIds(
    QueryInventoryByPartnerItemIdsDto: QueryInventoryByPartnerItemIdsDto,
    user: JwtUser
  ): Observable<
    Pick<InventoryItem, 'id' | 'implementationId' | 'partnerItemId' | 'implementation'>[]
  > {
    return of([] as any)
  }
}
