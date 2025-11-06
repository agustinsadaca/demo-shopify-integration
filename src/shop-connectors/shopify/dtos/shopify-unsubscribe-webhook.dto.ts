import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class ShopifyUnSubscribeWebhookDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  implementationId: number

  @ApiProperty({
    required: true,
    description:
      'provide full GID'
  })
  @IsNotEmpty()
  webhookId: string
}
