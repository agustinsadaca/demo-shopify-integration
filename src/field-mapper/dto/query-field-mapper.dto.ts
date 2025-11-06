import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryFieldMapperDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  implementationId?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entity?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityField?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityType?: string
}
