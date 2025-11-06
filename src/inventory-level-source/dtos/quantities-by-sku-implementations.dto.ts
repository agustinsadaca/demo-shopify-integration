import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray } from 'class-validator'

export class QuantitiesBySkuImplementationsDto {
  @ApiProperty({ type: 'string', required: true, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  skuImplementations: Array<string>
}
