import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class Dimension {

  @ApiProperty({ required: false })
  @IsOptional()
  weight?: number

  @ApiProperty({ required: false })
  @IsOptional()
  weightUnit?: string

  @ApiProperty({ required: false })
  @IsOptional()
  height?: number

  @ApiProperty({ required: false })
  @IsOptional()
  heightUnit?: string

  @ApiProperty({ required: false })
  @IsOptional()
  length?: number

  @ApiProperty({ required: false })
  @IsOptional()
  lengthUnit?: string

  @ApiProperty({ required: false })
  @IsOptional()
  width?: number

  @ApiProperty({ required: false })
  @IsOptional()
  widthUnit?: string
}
