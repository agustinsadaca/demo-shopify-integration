import { CreateInboundReceiptDto, JwtUser, UpdateInboundReceiptItemDto } from '@digital-logistics-gmbh/wh1plus-common/dist'
import { of } from 'rxjs'
import { InboundReceiptsService } from '../../../src/inbound-receipts/inbound-receipts.service'
import { MockType } from '../../utils/mock-type'

export const InboundReceiptServiceMockFactory: () => MockType<InboundReceiptsService> = jest.fn(() => ({
  updateInboundReceiptItem: jest.fn((id: number, updateDto: UpdateInboundReceiptItemDto, user: JwtUser) => {
    return of()
  }),
  bulkCreateInboundReceiptAndItem: jest.fn((createInboundReceiptDtoList: CreateInboundReceiptDto[], user: JwtUser) => {
    return Promise.resolve(createInboundReceiptDtoList)
  }),
}))