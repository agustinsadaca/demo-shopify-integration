import { Injectable } from '@nestjs/common'

@Injectable()
export class CarrierEventHandler {
  async handle(message: any): Promise<any> {
    return {}
  }

  async route(message: any): Promise<any> {
    return {}
  }
}
