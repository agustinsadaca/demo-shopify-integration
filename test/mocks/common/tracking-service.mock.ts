import { of } from 'rxjs'
import { TrackingsService } from '../../../src/trackings/trackings.service'
import TrackingCreateResponseDummy from '../../../test/dummies/common/tracking/tracking-create-response.dummy.json'
import { MockType } from '../../utils/mock-type'

export const TrackingsServiceMockFactory: () => MockType<TrackingsService> = jest.fn(() => ({
  createTracking: jest.fn(() => { return of(TrackingCreateResponseDummy) }),
}))