import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailSummaryTrackService {
  // Stub service for demo
  async trackEmail(data: any): Promise<any> {
    return {}
  }

  async trackLowStockItems(message: any): Promise<any> {
    return {}
  }

  async updateOnHoldEmailSummaryNotification(message: any): Promise<any> {
    return {}
  }
}
