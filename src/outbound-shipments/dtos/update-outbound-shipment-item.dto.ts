import { PartialType } from '@nestjs/mapped-types'
import { CreateOutboundShipmentItemDto } from './create-outbound-shipment-item.dto'

export class UpdateOutboundShipmentItemDto extends PartialType(CreateOutboundShipmentItemDto) { }
