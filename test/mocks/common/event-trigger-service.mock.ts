import { EventPayload } from '../../../src/core/interfaces/event-payload.interface'
import { CreateEventTriggerDto } from '../../../src/event-trigger/dtos/create-event-trigger.dto'
import { EventTriggerService } from '../../../src/event-trigger/event-trigger-service'
import { MockType } from '../../utils/mock-type'

export const EventTriggerServiceMockFactory: () => MockType<EventTriggerService> = jest.fn(() => ({
  createEventTrigger: jest.fn((data: CreateEventTriggerDto, isCron: boolean = false, isSftp: boolean = false) => {
    return Promise.resolve('created')
  }),
  consumeEventTrigger: jest.fn((payload: EventPayload) => {
    return Promise.resolve('consumed')
  }),
}))