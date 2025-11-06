import { JwtUser, Pagination } from '../core/types/common.types'
import { CreateImplementationDto } from './dtos/create-implementation.dto'
import { QueryImplementationDto } from './dtos/query-implementation.dto'
import { UpdateImplementationDto } from './dtos/update-implementation.dto'
// Entity type alias
type Implementation = any
import { Injectable } from '@nestjs/common'
import { of, Observable } from 'rxjs'

@Injectable()
export class ImplementationsService {
  constructor() {}

  filterImplementations(
    queryImplementationDto: QueryImplementationDto,
    user: JwtUser
  ): Observable<Pagination<Implementation>> {
    return of({ items: [], meta: {}, links: {} } as any)
  }

  getImplementation(id: number, user: JwtUser): Observable<Implementation> {
    return of({} as any)
  }

  create(
    createImplementationDto: CreateImplementationDto,
    user: JwtUser
  ): Observable<Implementation> {
    return of(createImplementationDto as any)
  }

  async update(
    id: number,
    updateImplementationDto: UpdateImplementationDto,
    user: JwtUser
  ): Promise<Implementation> {
    return updateImplementationDto as any
  }
}
