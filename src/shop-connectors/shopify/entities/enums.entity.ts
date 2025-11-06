export enum EntityEnum {
  order = 'order',
  orderItem = 'orderItem',
  inventoryItem = 'inventoryItem',
  inventoryLevel = 'inventoryLevel',
  outboundShipment = 'outboundShipment',
  outboundShipmentItem = 'outboundShipmentItem',
  returnShipment = 'returnShipment',
  returnShipmentItem = 'returnShipmentItem',
  refundOrder = 'refundOrder',
  notification = 'notification',
  partnerLocationInventoryItem = 'partnerLocationInventoryItem',
  fieldMapper = 'fieldMapper',
  inboundReceipt = 'inboundReceipt',
  inboundNotice = 'inboundNotice',
  returnRequest = 'returnRequest',
  tracking = 'tracking',
  connectionAuth = 'connectionAuth'
}

export enum ActionEnum {
  getMany = 'getMany',
  updateMany = 'updateMany',
  open = 'open',
  create = 'create',
  update = 'update',
  delete = 'delete',
  cancel = 'cancel',
  getTrackingDetailsReturnRequest = 'getTrackingDetailsReturnRequest'
}

export enum EventType {
  correction = 'correction',
  inboundReceipt = 'inboundReceipt',
  returnShipment = 'returnShipment',
  orderCreated = 'orderCreated',
  orderUpdated = 'orderUpdated',
  orderCancelled = 'orderCancelled'
}

export enum OrgType {
  Shop = 'Shop',
  Partner = 'Partner',
  Customer = 'Customer',
  Carrier = 'Carrier',
  Wms = 'Wms',
  WmsThirdPartyIntegration = 'WmsThirdPartyIntegration'
}

export enum Role {
  ShopUser = 'ShopUser',
  PartnerUser = 'PartnerUser',
  CustomerUser = 'CustomerUser',
  Admin = 'Admin',
  AdminUser = 'AdminUser',
  TenantUser = 'TenantUser'
}

export enum TargetSystemEnum {
  SHOPIFY = 'SHOPIFY',
  WMS = 'WMS',
  ERP = 'ERP',
  BILLBEE = 'BILLBEE',
  WOOCOMMERCE = 'WOOCOMMERCE',
  SHOPWARE = 'SHOPWARE',
  XENTRAL = 'XENTRAL',
  TM3 = 'TM3',
  SIGLOCH = 'SIGLOCH',
  JTL = 'JTL',
  DHL_FFN = 'DHL_FFN'
}

export enum ReportOperationTypeEnum {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

