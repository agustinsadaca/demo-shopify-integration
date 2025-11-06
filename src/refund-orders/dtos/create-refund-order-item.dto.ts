import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'

export class CreateRefundOrderItemDto {
  @ApiProperty({ required: true })
  @IsPositive()
  refundOrderId: number

  @ApiProperty({ required: true })
  @IsNotEmpty()
  sku: string

  @IsOptional()
  @IsString()
  skuImplementation?: string

  @ApiProperty({ required: true })
  @IsPositive()
  quantity: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  unitPrice?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  unitTax?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  total?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalTax?: number

}