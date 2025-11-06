export enum OrderStatus {
  waitingForFulfillment = 'waiting-for-fulfillment',
  toBeFixed = 'to-be-fixed',
  onHold = 'on-hold',
  new = 'new',
  open = 'open',
  cancelled = 'cancelled',
  completed = 'completed',
  partiallyShipped = 'partially-shipped',
  shipped = 'shipped',
  partiallyReturned = 'partially-returned',
  returned = 'returned',
  delivered = 'delivered',
  inDelivery = 'in-delivery',
  refunded = 'refunded',
  partiallyRefunded = 'partially-refunded',
  editInProgress = 'edit-in-progress',
  released = 'released',
}

export const OrderStatusAll = { ...OrderStatus }
