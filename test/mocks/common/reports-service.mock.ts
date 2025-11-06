import { of } from 'rxjs'
import { ReportsService } from '../../../src/reports/reports.service'
import { MockType } from '../../utils/mock-type'

export const ReportsServiceMockFactory: () => MockType<ReportsService> = jest.fn(() => {
  return {
    inventoryTrail: jest.fn(() => { return of() }),
    inventoryOrders: jest.fn(() => { return of() }),
    inventoryReturns: jest.fn(() => { return of() }),
    inventoryReturnShipmentReasons: jest.fn(() => { return of() }),
    orderCountByStatusChange: jest.fn(() => { return of() }),
    orderCountByLatestStatus: jest.fn(() => { return of() }),
    returnsCount: jest.fn(() => { return of() }),
    mostReturnedProducts: jest.fn(() => { return of() }),
    mostOrderedProducts: jest.fn(() => { return of() }),
    monthlyValidatedAddressCount: jest.fn(() => { return of() }),
  }
})