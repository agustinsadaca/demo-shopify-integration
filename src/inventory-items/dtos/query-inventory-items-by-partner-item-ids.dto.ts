import { ApiProperty, PickType } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsNotEmpty } from 'class-validator'

import { transformMultipleQueryStringIds } from '../../core/utils/transform-multiple-ids-query.util'
import { QueryInventoryItemDto } from './query-inventory-items.dto'

export class QueryInventoryByPartnerItemIdsDto extends PickType(QueryInventoryItemDto, [
  'partnerItemIds'
]) {
  @ApiProperty({ required: true, isArray: true, nullable: false })
  @Transform(({ value }) => {
    return transformMultipleQueryStringIds(value)
  })
  @IsArray()
  @IsNotEmpty({ message: 'partnerItemIds should not be empty' })
  partnerItemIds: string[]
}
