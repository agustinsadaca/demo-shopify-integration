import { Injectable } from '@nestjs/common'

@Injectable()
export class ShopEventHandler {
  async handle(message: any): Promise<any> {
    return {}
  }

  async route(message: any): Promise<any> {
    return {}
  }
}
