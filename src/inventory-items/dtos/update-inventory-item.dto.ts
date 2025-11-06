import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsByteLength,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUppercase,
  ValidateNested
} from 'class-validator'
import { InventoryItemStatus } from '../../core/enums/inventory-item-status.enum'
import { Dimension } from '../../core/interfaces/dimension.interface'
import { InventoryItemImageUrl } from '../../core/interfaces/inventory-item-image-url.interface'
import { MetaInfoInventoryItem } from '../../core/interfaces/meta-info-inventory-item.interface'
import { CreateInventoryItemDto } from './create-inventory-item.dto'

export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  sku?: string

  @ApiProperty({ required: false })
  @IsOptional()
  customerItemId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  partnerItemId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  dimensions?: Dimension

  @ApiProperty({ required: false })
  @IsOptional()
  name?: string

  @ApiProperty({ required: false })
  @IsPositive()
  @IsOptional()
  implementationId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  wmsSyncedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  shopSyncedAt?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  barcode?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  harmonizedSystemCode?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUppercase()
  @IsByteLength(2, 2)
  countryCodeOfOrigin?: string

  @ApiProperty({ required: false })
  @IsOptional()
  customerItemType?: string

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isBundle?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  metaInfo?: MetaInfoInventoryItem

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
  @IsBoolean()
  notFulfillable?: boolean

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  noInventoryLevelUpdate?: boolean

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isReady?: boolean

  @ApiProperty({ required: false, default: null })
  @IsOptional()
  @IsDateString()
  lowStockAt?: Date

  @ApiProperty({ required: false, default: null })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  lowStockThreshold?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  returnPeriod?: number

  @ApiProperty({ type: () => [InventoryItemImageUrl], required: false })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InventoryItemImageUrl)
  imagesUrl?: InventoryItemImageUrl[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isBatchRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isBestBeforeRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isBillOfMaterialsRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDivisibleRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isSerialNumberRequired?: boolean

  @ApiProperty({ required: false, enum: InventoryItemStatus })
  @IsOptional()
  @IsString()
  @IsEnum(InventoryItemStatus)
  status?: InventoryItemStatus
}
