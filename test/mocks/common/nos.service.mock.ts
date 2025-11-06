import { of } from 'rxjs'
import { NosService } from '../../../src/nos-connectors/nos.service'
import { MockType } from '../../utils/mock-type'

export const NosServiceMockFactory: () => MockType<NosService> = jest.fn(() => ({
  sendAcknowledgeInboundReceiptCreationToNos: jest.fn(() => { return of() }),
}))