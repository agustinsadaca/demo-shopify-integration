import { of } from 'rxjs'
import { BrandLabelService } from '../../../src/brand-label/brand-label.service'
import BrandLabelFilterResponseDummy from '../../../test/dummies/common/brand-label/brand-label-filter-response.dummy.json'
import BrandLabelGetOneResponseDummy from '../../../test/dummies/common/brand-label/brand-label-get-one-response.dummy.json'
import { MockType } from '../../utils/mock-type'

export const BrandLabelServiceMockFactory: () => MockType<BrandLabelService> = jest.fn(() => ({
  create: jest.fn(() => { return of(BrandLabelGetOneResponseDummy) }),
  findByFilter: jest.fn(() => { return of(BrandLabelFilterResponseDummy) }),
  update: jest.fn(() => { return Promise.resolve() }),
  findOne: jest.fn(() => { return of(BrandLabelGetOneResponseDummy) }),
  remove: jest.fn(() => { return Promise.resolve() })
}))