import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ShopifyGetSubscribedWebhooksDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  implementationId: number

  @ApiProperty({ required: false, description: 'default 100' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number

  @ApiProperty({ required: false, description: 'for pagination' })
  @IsString()
  @IsOptional()
  endCursor: string
}
