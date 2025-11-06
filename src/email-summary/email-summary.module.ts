import { Module } from '@nestjs/common'
import { EmailSummaryService } from './email-summary.service'
import { EmailSummaryTrackService } from './email-summary-track.service'

@Module({
  providers: [EmailSummaryService, EmailSummaryTrackService],
  exports: [EmailSummaryService, EmailSummaryTrackService]
})
export class EmailSummaryModule {}
