import { AxiosRequestConfig } from 'axios'
import { of } from 'rxjs'

const result = (data = []) => ({
  data: data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {}
})

export const HttpServiceMockFactory = {
  axiosRef: {
    get: jest.fn(() => {
      return of(result())
    }),
    post: jest.fn(() => {
      return of(result())
    }),
    defaults: {},
    interceptors: {
      request: {
        use: () => { return 1 },
        eject: (id: number) => { },
        clear: () => { }
      },
      response: {
        use: () => { return 1 },
        eject: (id: number) => { },
        clear: () => { }
      }
    },
    getUri: (config?: AxiosRequestConfig) => { return '' },
  },
  request: () => {
    return of(result())
  },
  get: jest.fn(() => {
    return of(result())
  }),
  post: jest.fn(() => {
    return of(result())
  }),
  patch: jest.fn(() => {
    return of(result())
  }),
}