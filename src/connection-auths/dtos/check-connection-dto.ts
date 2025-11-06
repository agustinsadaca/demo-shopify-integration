import { TargetSystemEnum } from '../../shop-connectors/shopify/entities/enums.entity'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator'

export class CheckConnectionDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  connectionUrl: string

  @ApiProperty({ required: true })
  @IsNotEmptyObject()
  authObject: object

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  authStrategy: string

  @ApiProperty({ enum: TargetSystemEnum })
  @IsNotEmpty()
  @IsString()
  @IsEnum(TargetSystemEnum)
  targetSystem: TargetSystemEnum
}
