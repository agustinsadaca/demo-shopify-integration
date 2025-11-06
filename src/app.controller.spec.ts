import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EventTriggerService } from './event-trigger/event-trigger-service'

describe('AppController', () => {
  const mockService = {
    handleChanges: jest.fn((entity) => entity),
    consumeEventTrigger: jest.fn((entity) => entity)
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        EventTriggerService,
        { provide: EventTriggerService, useValue: mockService }
      ]
    }).compile()

    app.get<AppController>(AppController)
  })

  describe('root', () => {
    it('should return topic', () => {})
  })
})
