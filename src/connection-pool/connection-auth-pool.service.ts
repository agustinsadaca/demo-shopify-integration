import { Injectable } from '@nestjs/common'

@Injectable()
export class ConnectionPoolService {
  // Stub service for demo
  async getConnection(key: any): Promise<any> {
    return {}
  }

  async getConnectionPool(key: any): Promise<any> {
    return {}
  }
}
