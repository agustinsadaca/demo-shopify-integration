export enum ReturnRequestStatus {
  initiated = 'initiated',
  awaiting = 'awaiting',
  inReview = 'in-review',
  rejected = 'rejected',
  approved = 'approved',
  labelGenerated = 'label-generated',
  picked = 'picked',
  inTransit = 'in-transit',
  handedOverToCarrier = 'handed-over-to-carrier',
  received = 'received'
}

export const ReturnRequestStatusAll = { ...ReturnRequestStatus, 'updated': 'updated' }
