import { ApiProperty } from "@nestjs/swagger"
import { Transform } from 'class-transformer'
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from "class-validator"
import { InventoryItemStatus } from '../../core/enums/inventory-item-status.enum'
import { transformMultipleQueryStringIds } from '../../core/utils/transform-multiple-ids-query.util'

export class AggregateByStatusInventoryItemDto {
  @ApiProperty({ required: true, enum: InventoryItemStatus, isArray: true })
  @IsEnum(InventoryItemStatus, { each: true })
  @Transform(({ value }) => {
    return transformMultipleQueryStringIds(value)
  })
  @IsArray()
  @IsNotEmpty({ message: "status should not be empty" })
  status: InventoryItemStatus[]

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isBundle?: boolean = false
}