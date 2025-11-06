import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsPositive, IsString } from 'class-validator'

export class UpdateOrdersMetaInfoIsShippingMethodUnknownDto {
  @ApiProperty({ required: true })
  @IsPositive()
  @Type(() => Number)
  implementationId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  shippingMethod: string

  @ApiProperty({ required: true })
  @IsBoolean()
  isDefault: boolean
}