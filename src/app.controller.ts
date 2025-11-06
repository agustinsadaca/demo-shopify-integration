import { Controller, Get, SetMetadata } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'

@Controller()
export class AppController {
  constructor() {}

  @Get('/')
  @SetMetadata('no-auth', true)
  @ApiOkResponse()
  async healthCheck() {
    return 'success'
  }
}
