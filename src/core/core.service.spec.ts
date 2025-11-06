import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { PinoLogger } from 'nestjs-pino'
import { ConfigService } from '../config.service'
import { HttpMiddlewareService } from './http-middleware.service'

describe('CoreService', () => {
  let service: HttpMiddlewareService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule.register(ConfigService.middlewareAxiosRequestConfig())],
      providers: [
        HttpMiddlewareService,
        {
          provide: PinoLogger,
          useValue: {
            logger: {
              bindings: jest.fn().mockReturnValue({ requestCorrelationId: 'test-correlation-id' })
            }
          }
        }
      ]
    }).compile()

    service = module.get<HttpMiddlewareService>(HttpMiddlewareService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
