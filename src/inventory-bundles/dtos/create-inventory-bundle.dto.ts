import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsPositive } from 'class-validator'

export class CreateInventoryBundleDto {
  @ApiProperty({ required: true })
  @IsPositive()
  @IsNotEmpty()
  implementationId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  bundleSkuImplementation: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  inventoryItemSkuImplementation: string

  @ApiProperty({ required: true })
  @IsPositive()
  @IsNotEmpty()
  quantity: number
}