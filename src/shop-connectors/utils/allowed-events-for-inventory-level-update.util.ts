import { EventType } from '../shopify/entities/enums.entity'

export const ALLOWED_EVENTS_SHOPIFY: EventType[] = [
  EventType.inboundReceipt,
  EventType.orderCancelled,
  EventType.returnShipment
]
