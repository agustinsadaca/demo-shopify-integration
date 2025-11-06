import { TargetSyncService } from '../../../src/core/target-sync.service'
import { MockType } from '../../utils/mock-type'

export const TargetSyncServiceMockFactory: () => MockType<TargetSyncService> = jest.fn(() => ({
  getLastSyncedAt: jest.fn((entityType: string, connectionId: number = 0) => {
    if (!connectionId) {
      return new Date('2021-01-01T00:00:00+01:00')
    }

    return Promise.resolve(new Date('2023-01-12 07:09:01+05:45'))
  }),
  setLastSyncedAt: jest.fn(() => {
    return Promise.resolve()
  }),
}))