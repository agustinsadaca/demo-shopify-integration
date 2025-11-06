import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryEmailSummaryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  implementationId?: number

  @ApiPropertyOptional()
  @IsOptional()
  notificationType?: string

  @ApiPropertyOptional()
  @IsOptional()
  action?: any

  @ApiPropertyOptional()
  @IsOptional()
  entity?: any
}
