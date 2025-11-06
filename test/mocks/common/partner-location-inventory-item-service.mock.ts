import { PartnerLocationInventoryItemsService } from '../../../src/partner-location-inventory-items/partner-location-inventory-items.service'
import { MockType } from '../../utils/mock-type'

export const PartnerLocationInventoryItemServiceMockFactory: () => MockType<PartnerLocationInventoryItemsService> = jest.fn(() => ({
  createPartnerLocationInventoryItem: jest.fn(() => { return Promise.resolve() }),
  filterPartnerLocationInventoryItems: jest.fn(() => { return Promise.resolve() }),
  getPartnerLocationInventoryItem: jest.fn(() => { return Promise.resolve() }),
  updateOrCreatePartnerLocationInventoryItem: jest.fn(() => { return Promise.resolve() }),
  updatePartnerLocationInventoryItem: jest.fn(() => { return Promise.resolve() }),
}))