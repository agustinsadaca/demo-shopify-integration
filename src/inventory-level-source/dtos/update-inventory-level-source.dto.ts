import { PartialType } from '@nestjs/swagger'
import { CreateInventoryLevelSourceDto } from './create-inventory-level-source.dto'

export class UpdateInventoryLevelSourceDto extends PartialType(CreateInventoryLevelSourceDto) { }