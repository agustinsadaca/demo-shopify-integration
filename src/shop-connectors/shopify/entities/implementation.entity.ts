export interface Implementation {
  id: number
  createdAt?: Date
  updatedAt?: Date
  customerId: number
  partnerId: number
  shopName: string
  wmsName: string
  implementationIdCustomer?: string
  implementationIdPartner?: string
  partnerLocationId: number
  customerLocationId: string
  isActive: boolean
  metaInfo?: {
    generalReturnPeriod?: number
    shopify_location_gid?: string
    [key: string]: any
  }
  customer?: {
    id: number
    createdAt?: Date
    updatedAt?: Date
    companyName: string
    nosCustomerCompanyId?: number
    companyAddressLine1?: string
    companyZipCode?: string
    companyCity?: string
    companyCountry?: string
    companyEmail?: string
    companyPhone?: string
    companyTaxNumber?: string
    companyTaxId?: string
  }
  partner?: {
    id: number
    createdAt?: Date
    updatedAt?: Date
    companyName: string
  }
  inventoryLevelSources?: any[]
  orders?: any[]
  notification?: any[]
  inventoryLevels?: any[]
  inventoryItems?: any[]
  partnerLocationInventoryItems?: any[]
  inboundNotices?: any[]
  inventoryBundles?: any[]
  shipsWith?: any[]
  returnRequests?: any[]
  refundOrders?: any[]
  returnReasons?: any[]
  returnSteps?: any[]
  partnerLocation?: any
  freeReturn?: any
}
