import { of } from 'rxjs'
import { OutboundShipmentsService } from '../../../src/outbound-shipments/outbound-shipments.service'
import { MockType } from '../../utils/mock-type'

export const OutboundShipmentsServiceMockFactory: () => MockType<OutboundShipmentsService> = jest.fn(() => ({
  getOutboundShipment: jest.fn(() => { return of([]) }),
  filterOutboundShipments: jest.fn(() => { return of([]) }),
  findAllShipmentsForTracking: jest.fn(() => { return of([]) }),
  createOutboundShipment: jest.fn(() => { return of({}) }),
  createOutboundShipmentHistory: jest.fn(() => { return of({}) }),
}))