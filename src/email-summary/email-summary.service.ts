import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailSummaryService {
  // Stub service for demo
  getNotificationType(): string {
    return 'default'
  }

  async sendSummary(data: any): Promise<any> {
    return {}
  }

  async findAll(filter: any, user: any): Promise<any[]> {
    return []
  }

  async sendEmailSummaryMail(emailSummary: any, user: any): Promise<any> {
    return {}
  }
}
