import { NotificationsService } from '../../../src/notifications/notifications.service'
import { MockType } from '../../utils/mock-type'

export const NotificationsServiceMockFactory: () => MockType<NotificationsService> = jest.fn(() => ({
  filterNotifications: jest.fn(() => { return Promise.resolve() }),
  getNotification: jest.fn(() => { return Promise.resolve() }),
  createNotification: jest.fn(() => { return Promise.resolve() }),
  updateNotification: jest.fn(() => { return Promise.resolve() })
}))