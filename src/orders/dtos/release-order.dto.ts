import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator'

export class ReleaseOrderDto {
  @ApiProperty({ required: true })
  @IsPositive()
  implementationId: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  delayOrderReleaseInMinutes?: number
}