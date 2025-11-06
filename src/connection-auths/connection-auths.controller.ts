import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common'
import { ConnectionAuthsService } from './connection-auths.service'
import { CreateConnectionAuthDto } from './dtos/create-connection-auth.dto'
import { UpdateConnectionAuthDto } from './dtos/update-connection-auth.dto'

@Controller('connection-auths')
export class ConnectionAuthsController {
  constructor(private readonly connectionAuthsService: ConnectionAuthsService) {}

  @Post()
  create(@Body() createConnectionAuthDto: CreateConnectionAuthDto, @Req() req) {
    return this.connectionAuthsService.create(createConnectionAuthDto, req.user)
  }

  @Get()
  findAll() {
    return this.connectionAuthsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.connectionAuthsService.findOne(+id, req.user)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConnectionAuthDto: UpdateConnectionAuthDto,
    @Req() req
  ) {
    return this.connectionAuthsService.update(+id, updateConnectionAuthDto, req.user)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.connectionAuthsService.remove(+id)
  }
}
