export class CreateShipmentDto {
  orderId?: number
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  items?: any[]
  [key: string]: any
}
