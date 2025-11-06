export enum OutboundShipmentStatus {
  shipped = 'shipped',
  delivered = 'delivered',
  inDelivery = 'in-delivery',
  closed = 'closed'
}

// export const OutboundShipmentStatusAll = [...Object.values(OutboundShipmentStatus), 'updated']

export const OutboundShipmentStatusAll = { ...OutboundShipmentStatus, 'updated': 'updated' }