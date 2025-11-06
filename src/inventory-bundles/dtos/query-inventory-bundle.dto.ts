import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryInventoryBundleDto extends PaginatorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  id?: number

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  implementationId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  bundleSkuImplementation?: string

  @ApiProperty({ required: false })
  @IsOptional()
  inventoryItemSkuImplementation?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  quantity?: number
}