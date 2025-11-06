import { of } from 'rxjs'
import { HttpMiddlewareService } from '../../../src/core/http-middleware.service'
import { MockType } from '../../utils/mock-type'

export const HttpMiddlewareServiceMockFactory: () => MockType<HttpMiddlewareService> = jest.fn(() => ({
  createTracking: jest.fn(() => { return of({}) }),
  filterCountry: jest.fn(() => { return of({ "items": [], "meta": { "totalItems": 0, "itemCount": 0, "itemsPerPage": 10, "totalPages": 0, "currentPage": 1 }, "links": { "first": "/countries/filter/?limit=10", "previous": "", "next": "", "last": "" } }) }),
}))