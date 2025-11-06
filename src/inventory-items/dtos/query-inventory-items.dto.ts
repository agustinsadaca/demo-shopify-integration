import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsByteLength, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUppercase, isEmpty } from 'class-validator'
import { InventoryItemStatus } from '../../core/enums/inventory-item-status.enum'
import { Dimension } from '../../core/interfaces/dimension.interface'
import { transformMultipleQueryStringIds } from '../../core/utils/transform-multiple-ids-query.util'
import { PaginatorDto } from '../../core/dtos/paginator.dto'

export class QueryInventoryItemDto extends PaginatorDto {
  @ApiProperty({ required: false, isArray: true, nullable: false })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value
    if (isEmpty(value)) return []
    return value.split(',').map(Number).filter((id) => !isNaN(id))
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ message: "inventory-item ids should not be empty", })
  ids?: number[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  sku?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  customerItemId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  partnerItemId?: string

  @ApiProperty({ required: false, isArray: true, nullable: false })
  @Transform(({ value }) => {
    return transformMultipleQueryStringIds(value)
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ message: "partnerItemIds should not be empty" })
  partnerItemIds?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  dimensions?: Dimension

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  wmsSyncedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  shopSyncedAt?: Date

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  implementationId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  barcode?: string

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  price?: number

  @ApiProperty({ required: false })
  @IsOptional()
  harmonizedSystemCode?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUppercase()
  @IsByteLength(2, 2)
  countryCodeOfOrigin?: string

  @ApiProperty({ required: false })
  @IsOptional()
  customerItemType?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isBundle?: boolean = false

  @ApiProperty({
    required: false,
    description: 'write json as { "field": "sellable", "direction": "ASC" OR "DESC" }',
    example: '{ "field": "sellable", "direction": "ASC" }'
  })
  @IsOptional()
  sortBy?: string

  @ApiProperty({
    required: false,
    description: 'Write json as { "RangeKeyword": value }, Available: gt, gte, lt, lte, eq',
    example: '{ "gt": 5 }'
  })
  @IsOptional()
  sellable?: string

  @ApiProperty({
    description: "add a string to be contained in either of 'sku', 'name', 'partnerItemId' of related inventory item",
    required: false
  })
  @IsOptional()
  contains?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  packagingRatio?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  packagingGroupSku?: string

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  notFulfillable?: boolean

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  noInventoryLevelUpdate?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isReady?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  lowStockAt?: Date

  @ApiProperty({ required: false, example: 4 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  lowStockThreshold?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  ignoreReadiness?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  lowStock?: boolean

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  returnPeriod?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string


  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isReport?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isBatchRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isBestBeforeRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isBillOfMaterialsRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isDivisibleRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isSerialNumberRequired?: boolean

  @ApiProperty({ required: false, enum: InventoryItemStatus })
  @IsOptional()
  @IsString()
  @IsEnum(InventoryItemStatus)
  status?: InventoryItemStatus

	@ApiProperty({ required: false })
	@IsOptional()
	@Type(() => Number)
	byPassCache?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean
}