import { PartialType } from '@nestjs/swagger'
import { CreateConnectionAuthDto } from './create-connection-auth.dto'

export class UpdateConnectionAuthDto extends PartialType(CreateConnectionAuthDto) { }
