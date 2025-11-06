export enum InboundNoticeStatus {
  new = 'new',
  open = 'open',
  partiallyArrived = 'partially-arrived',
  arrived = 'arrived',
}

export const InboundNoticeStatusAll = { ...InboundNoticeStatus, 'updated': 'updated' }
