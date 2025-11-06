import { AnnouncementsService } from '../../../src/announcements/announcements.service'
import { MockType } from '../../utils/mock-type'

export const announcementServiceMockFactory: () => MockType<AnnouncementsService> = jest.fn(() => ({
  create: jest.fn(entity => entity),
  findOne: jest.fn(entity => entity),
  update: jest.fn(entity => entity),
  remove: jest.fn(entity => entity),
  findByFilter: jest.fn(entity => entity)
}))