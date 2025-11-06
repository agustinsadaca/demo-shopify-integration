import { PartnerLocationStorageItemsService } from '../../../src/partner-location-storage-item/partner-location-storage-items.service'
import { MockType } from '../../utils/mock-type'

export const PartnerLocationStorageItemServiceMockFactory: () => MockType<PartnerLocationStorageItemsService> = jest.fn(() => ({
  filterPartnerLocationStorageItems: jest.fn(() => { return Promise.resolve() }),
  getPartnerLocationStorageItem: jest.fn(() => { return Promise.resolve() }),
  createPartnerLocationStorageItem: jest.fn(() => { return Promise.resolve() }),
  createOrUpdatePartnerLocationStorageItem: jest.fn(() => { return Promise.resolve() }),
  deletePartnerLocationStorageItem: jest.fn(() => { return Promise.resolve() }),
  updatePartnerLocationStorageItem: jest.fn(() => { return Promise.resolve() }),
}))