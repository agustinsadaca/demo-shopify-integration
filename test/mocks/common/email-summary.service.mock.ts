import { EmailSummaryService } from '../../../src/email-summary/email-summary.service'
import { MockType } from '../../utils/mock-type'

export const EmailSummaryServiceMockFactory: () => MockType<EmailSummaryService> = jest.fn(() => ({
  create: jest.fn(() => { return Promise.resolve() }),
  findAll: jest.fn(() => { return Promise.resolve() }),
  findByFilter: jest.fn(() => { return Promise.resolve() }),
  update: jest.fn(() => { return Promise.resolve() }),
  remove: jest.fn(() => { return Promise.resolve() }),
  trackReturnRequestLabelCreation: jest.fn(() => { return Promise.resolve() }),
}))