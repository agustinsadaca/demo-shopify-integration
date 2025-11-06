import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator'
import { FieldMapperEntityTypesEnum } from '../enums/entity-types.enum'

export class CreateFieldMapperDto {
  @ApiProperty({ enum: FieldMapperEntityTypesEnum, required: true })
  @IsNotEmpty() @IsString()
  @IsEnum(FieldMapperEntityTypesEnum)
  entityType: string

  @ApiProperty({ required: true })
  @IsNotEmpty() @IsString()
  entityField: string

  @ApiProperty({ required: true })
  @IsNotEmpty() @IsString()
  wmsValue: string

  @ApiProperty({ required: true })
  @IsNotEmpty() @IsString()
  shopValue: string

  @ApiProperty({ required: true })
  @IsNotEmpty() @IsPositive()
  implementationId: number

  @ApiProperty({ required: true })
  @IsNotEmpty() @IsString()
  name: string

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}