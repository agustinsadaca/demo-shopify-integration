import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator'
import { InventoryItemStatus } from '../../core/enums/inventory-item-status.enum'

export class QueryInventoryByListDto {
  @ApiProperty({ type: Array<string>, nullable: false })
  @IsArray()
  @Type(() => String)
  skuImplementationList: string[]

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  shouldIncludeBundle?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsEnum(InventoryItemStatus)
  status?: InventoryItemStatus[]
}
