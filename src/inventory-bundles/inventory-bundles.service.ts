import { JwtUser } from '../core/types/common.types'
import { CreateInventoryBundleDto } from './dtos/create-inventory-bundle.dto'
import { FilterByInventoryItemSkuImplementationIdsDto } from './dtos/filter-by-inventory-item-sku-implementation-ids.dto'
import { QueryInventoryBundleDto } from './dtos/query-inventory-bundle.dto'
import { UpdateInventoryBundleDto } from './dtos/update-inventory-bundle.dto'
// Entity type alias
type InventoryBundle = any
import { Injectable } from '@nestjs/common'
import { of, Observable } from 'rxjs'
import { PaginatedResult } from '../core/interfaces/pagination-result.interface'

@Injectable()
export class InventoryBundlesService {
  constructor() { }

  getInventoryBundle(id: number, user: JwtUser): Observable<InventoryBundle> {
    return of({} as any)
  }

  filterInventoryBundles(queryDto: QueryInventoryBundleDto, user: JwtUser): Observable<PaginatedResult<InventoryBundle>> {
    return of({ items: [], meta: {}, links: {} } as any)
  }

  createInventoryBundle(createDto: CreateInventoryBundleDto, user: JwtUser): Observable<InventoryBundle> {
    return of(createDto as any)
  }

  async updateInventoryBundle(id, updateDto: UpdateInventoryBundleDto, user: JwtUser): Promise<InventoryBundle> {
    return updateDto as any
  }

  getInventoryBundlesByBundleSkuImplementation(bundleSkuImplementationCsv: string, user: JwtUser): Observable<InventoryBundle[]> {
    return of([] as any)
  }

  getInventoryBundlesByInventoryItemSkuImplementation(queryInventoryBundleDto: FilterByInventoryItemSkuImplementationIdsDto, user: JwtUser): Observable<InventoryBundle[]> {
    return of([] as any)
  }

  removeInventoryBundle(id: number, user: JwtUser): Observable<any> {
    return of({ deleted: true })
  }
}
