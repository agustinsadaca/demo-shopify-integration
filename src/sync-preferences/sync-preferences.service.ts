import { Injectable } from '@nestjs/common'

@Injectable()
export class SyncPreferencesService {
  async findOneByFilter(filter: any): Promise<any> {
    return {}
  }

  async update(id: number, data: any): Promise<any> {
    return {}
  }
}
