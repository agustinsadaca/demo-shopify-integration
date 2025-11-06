export enum EventType {
  order = 'order',
  outboundShipment = 'outbound-shipment',
  cancellation = 'cancellation',
  cancellationPostShipment = 'cancellation-post-shipment',
  cancellationPreShipment = 'cancellation-pre-shipment',
  inboundReceipt = 'inbound-receipt',
  returnShipment = 'return-shipment',
  correction = 'correction',
  createBundle = 'create-bundle',
  updateBundle = 'update-bundle',
  removeBundle = 'remove-bundle',
  partnerLocationInventoryItemUpdate = 'partner-location-inventory-item-update',
  orderChange = 'order-change'
}