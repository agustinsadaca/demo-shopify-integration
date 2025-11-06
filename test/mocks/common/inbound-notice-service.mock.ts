import {
  CreateInboundNoticeHistoryDto,
  JwtUser,
  PaginatorDto,
  UpdateInboundNoticeDto,
  UpdateInboundNoticeItemDto
} from '@digital-logistics-gmbh/wh1plus-common/dist'
import { of } from 'rxjs'
import { InboundNoticesService } from '../../../src/inbound-notices/inbound-notices.service'
import CreateInboundNoticeDummy from '../../dummies/common/inbound-notice/create-inbound-notice.dummy.json'
import InboundNoticePaginateResultDummy from '../../dummies/common/inbound-notice/inbound-notice.dummy.json'
import { MockType } from '../../utils/mock-type'

export const InboundNoticeServiceMockFactory: () => MockType<InboundNoticesService> = jest.fn(
  () => ({
    getInboundNoticesOfStatusNotArrived: jest.fn((paginationDto: PaginatorDto, user: JwtUser) => {
      return of(InboundNoticePaginateResultDummy)
    }),
    updateInboundNotice: jest.fn((updateInboundNotice: UpdateInboundNoticeDto, user: JwtUser) => {
      const id = Math.floor(Math.random() * 3423424)
      return of({ ...CreateInboundNoticeDummy, ...updateInboundNotice, id })
    }),
    createInboundNoticeHistory: jest.fn(
      (createInboundNoticeHistory: CreateInboundNoticeHistoryDto, user: JwtUser) => {
        const id = Math.floor(Math.random() * 3423424)
        return of({ ...createInboundNoticeHistory, id })
      }
    ),
    updateInboundNoticeItem: jest.fn(
      (id: number, updateInboundNoticeItem: UpdateInboundNoticeItemDto, user: JwtUser) => {
        return of({ id, ...updateInboundNoticeItem })
      }
    ),
    getInboundNoticeByPartnerInboundNoticeIds: jest.fn((queryDto: any, user: JwtUser) => {
      return of([])
    })
  })
)
