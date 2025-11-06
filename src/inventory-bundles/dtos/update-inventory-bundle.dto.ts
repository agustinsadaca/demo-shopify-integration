import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsPositive } from 'class-validator'

export class UpdateInventoryBundleDto {
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