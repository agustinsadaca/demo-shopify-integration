import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsOptional, IsPositive, IsString } from 'class-validator'
import { FieldMapperEntityTypesEnum } from '../enums/entity-types.enum'

export class UpdateFieldMapperDto {
  @ApiProperty({ enum: FieldMapperEntityTypesEnum, required: false })
  @IsOptional() @IsString()
  @IsEnum(FieldMapperEntityTypesEnum)
  entityType?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  entityField?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  wmsValue?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  shopValue?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsPositive()
  implementationId?: number

  @ApiProperty({ required: true })
  @IsOptional() @IsString()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
