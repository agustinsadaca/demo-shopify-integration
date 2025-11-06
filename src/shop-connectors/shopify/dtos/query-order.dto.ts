export class QueryOrderDto {
  ids?: string
  created_at_min?: Date
  created_at_max?: Date
  updated_at_min?: Date
  updated_at_max?: Date
  order?: string
  limit?: number
  financial_status?: string
  fulfillment_status?: string
}

export class QueryShopifyGetOrderDto {
  assignmentStatus: EShopifyFulfillmentAssignmentStatus
  limit: number
  locationId: string
}

export enum EShopifyFulfillmentAssignmentStatus {
  CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED',
  FULFILLMENT_ACCEPTED = 'FULFILLMENT_ACCEPTED',
  FULFILLMENT_REQUESTED = 'FULFILLMENT_REQUESTED',
  FULFILLMENT_UNSUBMITTED = 'FULFILLMENT_UNSUBMITTED'
}


export class QueryFulfillmentOrderMetaInfoDto {
  fulfillmentOrdersIds: string
  limit: number
}
