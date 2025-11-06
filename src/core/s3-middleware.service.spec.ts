import { Scope } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { S3MiddlewareService } from './s3-middleware.service'

describe('S3MiddlewareService', () => {
  let service: S3MiddlewareService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: S3MiddlewareService, useClass: S3MiddlewareService, scope: Scope.DEFAULT }
      ]
    }).compile()

    service = module.get<S3MiddlewareService>(S3MiddlewareService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
