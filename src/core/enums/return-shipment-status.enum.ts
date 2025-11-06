export enum ReturnShipmentStatus {
  received = 'received'
}

// export const ReturnShipmentStatusAll = [...Object.values(ReturnShipmentStatus), 'updated']

export const ReturnShipmentStatusAll = { ...ReturnShipmentStatus, 'updated': 'updated' }
