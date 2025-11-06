import { Injectable } from '@nestjs/common'

@Injectable()
export class AutomationEngineService {
  // Stub service for demo
  async processAutomation(data: any): Promise<any> {
    return {}
  }

  async executeRules(data: any, context?: any): Promise<any> {
    return data
  }
}
