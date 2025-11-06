import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator'

export class SpecificReturnPeriod {
  @ApiProperty({ required: true })
  @IsPositive()
  id: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  sku: string

  @ApiProperty({ required: true, minimum: 0 })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  returnPeriod: number
}

export class UpdateReturnPeriodDto {
  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsPositive()
  generalReturnPeriod?: number

  @ApiProperty({ required: false, minimum: 0, isArray: true, type: SpecificReturnPeriod })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SpecificReturnPeriod)
  specificReturnPeriods?: Array<SpecificReturnPeriod>
}