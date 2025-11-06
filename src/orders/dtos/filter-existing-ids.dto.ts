import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray } from 'class-validator'

export class QueryOrderByExistingCustomerIdsFilterDto {
  @ApiProperty({ type: 'string', required: true, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  customerOrderIds: Array<string>
}
