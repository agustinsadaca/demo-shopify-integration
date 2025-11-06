import { OrgType, TargetSystemEnum } from '../../shop-connectors/shopify/entities/enums.entity'
import { PaginatorDto } from '../../core/types/common.types'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, Matches } from 'class-validator'

export class QueryConnectionAuthsDto extends PaginatorDto {
  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  implementationId?: number

  @ApiProperty({ type: 'number', required: false, isArray: true })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ each: true })
  sharedImplementations?: number[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  connectionUrl?: string

  @ApiProperty({ required: false, enum: OrgType })
  @IsOptional()
  @IsEnum(OrgType)
  targetType?: OrgType

  @ApiProperty({ required: false, enum: TargetSystemEnum })
  @IsOptional()
  @IsString()
  @IsEnum(TargetSystemEnum)
  targetSystem?: TargetSystemEnum

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  authStrategy?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  targetTypeId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  targetSystemConnectionId?: string

  @ApiProperty({ required: false, description: "+HH:MM or ZoneName()" })
  @IsOptional()
  @IsNotEmpty()
  @Matches(/(?:^[+|-](\d{2})[:](\d{2})$)|(?:[\w]+\/[\w]+)/g, {
    message: "timezone must match +HH:MM format or zone name"
  })
  defaultTimezone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  delayOrderReleaseInMinutes?: number
}
