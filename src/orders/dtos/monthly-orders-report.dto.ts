import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsPositive } from 'class-validator'

export class MonthlyOrdersReportDto {
  @ApiProperty({ type: Number, required: false })
  @IsPositive()
  months: number

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  is_active_implementataion: boolean

  @ApiProperty({
    example: '1,2,3',
    description: 'Comma-separated list of NOS customer company IDs to include in the report',
    type: 'string',
    format: 'csv',
    required: false
  })
  nos_company_ids: string
}