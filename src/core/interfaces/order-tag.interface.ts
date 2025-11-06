import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsPositive, IsString } from 'class-validator'

export class OrderTagDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'external reference' })
  @IsPositive()
  id: number

  @ApiProperty()
  @IsBoolean()
  isInternal: boolean
}