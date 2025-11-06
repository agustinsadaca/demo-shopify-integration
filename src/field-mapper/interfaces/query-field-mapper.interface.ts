import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsPositive } from 'class-validator'

export class QueryFieldMapper {
  @ApiProperty({ type: 'number', required: true })
  @IsPositive()
  @Type(() => Number)
  implementationId: number
}