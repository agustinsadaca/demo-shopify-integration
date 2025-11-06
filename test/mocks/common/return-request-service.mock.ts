import { JwtUser, UpdateReturnRequestDto } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { of } from 'rxjs'
import { ReturnRequestsService } from '../../../src/return-requests/return-requests.service'
import ReturnRequestHistoryCreateResponseDummy from '../../../test/dummies/common/return-request-history/return-request-history-create-response.dummy.json'
import ReturnRequestsOfStatusNotReceivedDummy from "../../../test/dummies/common/return-request/return-request-of-status-not-received.dummy.json"
import { MockType } from '../../utils/mock-type'

export const ReturnRequestServiceMockFactory: () => MockType<ReturnRequestsService> = jest.fn(() => ({
  createReturnRequest: jest.fn(() => { return of({}) }),
  createReturnRequestHistory: jest.fn(() => { return of(ReturnRequestHistoryCreateResponseDummy) }),
  createReturnRequestItem: jest.fn(() => { return of({}) }),
  updateReturnRequest: jest.fn((id: number, updateDto: UpdateReturnRequestDto, user: JwtUser) => { return of({}) }),
  filterReturnRequests: jest.fn(() => { return of([]) }),
  getReturnRequest: jest.fn(() => { return of([]) }),
  bulkCreateReturnRequestHistories: jest.fn(() => { return of([]) }),
  bulkUpdateReturnRequestsUsingReturnRequestId: jest.fn(() => { return of([]) }),
  getReturnRequestsOfStatusNotReceived: jest.fn(() => {
    return of(ReturnRequestsOfStatusNotReceivedDummy)
  }),
}))