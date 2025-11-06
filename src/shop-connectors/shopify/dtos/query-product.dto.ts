export class QueryProductDto {
  created_at_min?: Date
  created_at_max?: Date
  updated_at_min?: string
  updated_at_max?: Date
  product_status?: string = 'active'
  limit?: number
}

export class QueryProductMetaInfoDto {
  product_status: string = 'active'
  limit: number
  customerItemIdsQuery: string
}
