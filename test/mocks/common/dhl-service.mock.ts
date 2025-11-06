import { Order, ReturnRequest } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { of } from 'rxjs'
import { DhlService } from '../../../src/carrier-connectors/dhl/dhl.service'
import { RoutedMessage } from '../../../src/event-handlers/interfaces/routed-message.interface'
import { MockType } from '../../utils/mock-type'

export const DHLServiceMockFactory: () => MockType<DhlService> = jest.fn(() => ({
  setConnection: jest.fn(),
  generateReturnLabel: jest.fn((entity, object) => of({})),
  createReturnRequest: jest.fn((returnRequest: ReturnRequest, order: Order, message?: RoutedMessage) => { return Promise.resolve() }),
  createTrackingRecordsForReturnRequest: jest.fn((message?: RoutedMessage) => { return Promise.resolve() }),
  processReturnRequest: jest.fn((returnRequests: ReturnRequest[], jwtUser) => { return Promise.resolve() }),
}))