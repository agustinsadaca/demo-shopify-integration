import { of } from 'rxjs'
import { ReturnShipmentsService } from '../../../src/return-shipments/return-shipments.service'
import { MockType } from '../../utils/mock-type'

export const ReturnShipmentServiceMockFactory: () => MockType<ReturnShipmentsService> = jest.fn(() => ({
  updateOrCreateReturnShipment: jest.fn(() => { return of({}) }),
}))