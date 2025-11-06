import { CreateInventoryItemDto, JwtUser, UpdateInventoryItemDto } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { of } from 'rxjs'
import { InventoryItemsService } from '../../../src/inventory-items/inventory-items.service'
import DummyInventoryItem from '../../dummies/common/inventory-item/inventory-item.dummy.json'
import { MockType } from '../../utils/mock-type'

export const InventoryItemServiceMockFactory: () => MockType<InventoryItemsService> = jest.fn(() => ({
  createInventoryItem: jest.fn((createInventoryItem: CreateInventoryItemDto, user: JwtUser) => {
    const id = Math.floor(Math.random() * 3423424)
    return of({ ...createInventoryItem, id })
  }),
  bulkUpdateInventoryItems: jest.fn(() => { return Promise.resolve() }),
  getInventoryItem: jest.fn(() => { return Promise.resolve() }),
  filterInventoryItems: jest.fn(() => { return Promise.resolve() }),
  filterInventoryItemsUsingList: jest.fn(() => { return Promise.resolve() }),
  getLowStockInventoryItems: jest.fn(() => { return Promise.resolve() }),
  updateInventoryItem: jest.fn((updateInventoryItem: UpdateInventoryItemDto, user: JwtUser) => {
    const id = Math.floor(Math.random() * 3423424)

    return of({ ...DummyInventoryItem, ...updateInventoryItem, id })
  }),
  updateOrCreateInventoryItems: jest.fn(() => { return Promise.resolve() }),
  filterByPartnerItemIds: jest.fn(() => { return Promise.resolve() }),
}))