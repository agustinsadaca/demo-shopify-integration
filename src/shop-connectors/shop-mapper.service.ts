import { Injectable } from '@nestjs/common'

@Injectable()
export abstract class ShopMapperService {
  abstract mapFrom(mapType: string, data: any)
  abstract mapTo(mapType: string, data: any)
}