import { JwtUser } from '../core/types/common.types'
import { CreateOutboundShipmentDto } from './dtos/create-outbound-shipment.dto'
import { CreateOutboundShipmentHistoryDto } from './dtos/create-outbound-shipment-history.dto'
import { QueryOutboundShipmentDto } from './dtos/query-outbound-shipment.dto'
import { QueryOutboundShipmentHistoryDto } from './dtos/query-outbound-shipment-history.dto'
import { QueryOutboundShipmentItemDto } from './dtos/query-outbound-shipment-item.dto'
import { QueryShipmentsForTrackingDto } from './dtos/query-outbound-shipment-for-tracking.dto'
import { UpdateOutboundShipmentDto } from './dtos/update-outbound-shipment.dto'
import { UpdateOutboundShipmentHistoryDto } from './dtos/update-outbound-shipment-history.dto'
import { UpdateOutboundShipmentItemDto } from './dtos/update-outbound-shipment-item.dto'
// Entity types - using any since entities are not defined locally
type OutboundShipment = any
type OutboundShipmentHistory = any
type OutboundShipmentItem = any
import { Injectable } from '@nestjs/common'
import { Observable, of } from 'rxjs'
import { PaginatedResult } from '../core/interfaces/pagination-result.interface'

@Injectable()
export class OutboundShipmentsService {
  constructor() { }

  filterOutboundShipments(queryOutboundShipmentDto: QueryOutboundShipmentDto, user: JwtUser): Observable<PaginatedResult<OutboundShipment>> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getOutboundShipment(id: number, user: JwtUser): Observable<OutboundShipment> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  findAllShipmentsForTracking(queryDto: QueryShipmentsForTrackingDto, user: JwtUser): Observable<OutboundShipment[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  findAllDeliveredShipmentsForTracking(queryDto: QueryShipmentsForTrackingDto, user: JwtUser): Observable<OutboundShipment[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  createOutboundShipment(createOutboundShipmentDto: CreateOutboundShipmentDto, user: JwtUser): Observable<OutboundShipment> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  updateOutboundShipment(id: number, updateOutboundShipmentDto: UpdateOutboundShipmentDto, user: JwtUser): Observable<OutboundShipment> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  filterOutboundShipmentHistories(queryOutboundShipmentHistoryDto: QueryOutboundShipmentHistoryDto, user: JwtUser): Observable<OutboundShipmentHistory[]> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getOutboundShipmentHistory(id: number, user: JwtUser): Observable<OutboundShipmentHistory> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  createOutboundShipmentHistory(createOutboundShipmentHistoryDto: CreateOutboundShipmentHistoryDto, user: JwtUser): Observable<OutboundShipmentHistory> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  updateOutboundShipmentHistory(id: number, updateOutboundShipmentHistoryDto: UpdateOutboundShipmentHistoryDto, user: JwtUser): Observable<OutboundShipmentHistory> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  filterOutboundShipmentItems(queryOutboundShipmentItemDto: QueryOutboundShipmentItemDto, user: JwtUser): Observable<PaginatedResult<OutboundShipmentItem>> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getSerialNumbers(user: JwtUser) {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getLotNumbers(user: JwtUser) {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  getOutboundShipmentItem(id: number, user: JwtUser): Observable<OutboundShipmentItem> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }


  updateOutboundShipmentItem(id: number, updateOutboundShipmentItemDto: UpdateOutboundShipmentItemDto, user: JwtUser): Observable<OutboundShipmentItem> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }

  updateOrCreateOutboundShipments(createOutboundShipmentDtoList: CreateOutboundShipmentDto[], user: JwtUser): Observable<any> {
    try {
      return of({} as any)
    } catch (err) {
      throw err
    }
  }
}
