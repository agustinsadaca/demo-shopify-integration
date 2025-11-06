import { FieldMapperService } from '../../../src/field-mapper/field-mapper.service'
import { FieldMapperValue } from '../../../src/field-mapper/interfaces/field-mapper-value.interface'
import { MockType } from '../../utils/mock-type'

export const FieldMapperServiceMockFactory: () => MockType<FieldMapperService> = jest.fn(() => ({
  create: jest.fn(() => { return Promise.resolve() }),
  find: jest.fn(() => { return Promise.resolve() }),
  findAll: jest.fn(() => { return Promise.resolve() }),
  findByFilter: jest.fn(() => { return Promise.resolve({ items: [] }) }),
  update: jest.fn(() => { return Promise.resolve() }),
  remove: jest.fn(() => { return Promise.resolve() }),
  getValueFromFieldMapper: jest.fn(() => {
    const fieldMapperObject: FieldMapperValue = {
      fieldMappersObj: {
        '105_Standard': 'DHL'
      },
      defaultFieldMapper: null
    }

    return Promise.resolve(fieldMapperObject)
  })
}))