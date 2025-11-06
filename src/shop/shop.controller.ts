import { IPaginationOptions, Pagination } from '../core/types/common.types'
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger'
import { Observable } from 'rxjs'
import { Roles } from '../auth/roles/role.decorator'
import { Role } from '../shop-connectors/shopify/entities/enums.entity'
import {
  CreateConnectionAuthDto,
  CreateShopifyIntregrationDto
} from '../connection-auths/dtos/create-connection-auth.dto'
import { QueryConnectionAuthsDto } from '../connection-auths/dtos/query-connection-auths.dto'
import { UpdateConnectionAuthDto } from '../connection-auths/dtos/update-connection-auth.dto'
import { ConnectionAuth } from '../connection-auths/entities/connection-auth.entity'
import { TestConnectionResponseInterface } from '../connection-auths/interface/test-connection-response.interface'
import { PaginatedResult } from '../core/interfaces/pagination-result.interface'
import { FieldMapper } from '../field-mapper/entities/field-mapper.entity'
import { QueryFieldMapper } from '../field-mapper/interfaces/query-field-mapper.interface'
import GetInventoryItemShopStockLevelsResponseDto from './dtos/get-inventory-item-shop-stock-levels-response.dto'
import { ShopService } from './shop.service'

@ApiTags('shop')
@Controller('shop')
@ApiBearerAuth()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // Connection Auth endpoints
  @Post('connection-auths/test/:id')
  @ApiOperation({ summary: 'Test connection' })
  @ApiOkResponse({ description: 'Connection test result' })
  @Roles(Role.Admin)
  testConnection(@Param('id', ParseIntPipe) id: number): Promise<TestConnectionResponseInterface> {
    return this.shopService.testConnection(id)
  }

  @Get('connection-auths')
  @ApiOperation({ summary: 'Filter connection auths' })
  @ApiOkResponse({ description: 'List of connection auths' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Roles(Role.Admin)
  filterConnectionAuths(
    @Query() queryDto: QueryConnectionAuthsDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: any
  ): Promise<Pagination<ConnectionAuth>> {
    const options: IPaginationOptions = { page, limit }
    return this.shopService.filterConnectionAuths(queryDto, options, req.user)
  }

  @Get('connection-auths/:id')
  @ApiOperation({ summary: 'Get connection auth by ID' })
  @ApiOkResponse({ description: 'Connection auth details' })
  @Roles(Role.Admin)
  getConnectionAuth(@Param('id', ParseIntPipe) id: number, @Req() req: any): Promise<ConnectionAuth> {
    return this.shopService.getConnectionAuth(id, req.user)
  }

  @Patch('connection-auths/:id')
  @ApiOperation({ summary: 'Update connection auth' })
  @ApiOkResponse({ description: 'Connection auth updated' })
  @Roles(Role.Admin)
  updateConnectionAuth(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateConnectionAuthDto,
    @Req() req: any
  ) {
    return this.shopService.updateConnectionAuth(id, updateDto, req.user)
  }

  @Post('connection-auths')
  @ApiOperation({ summary: 'Create connection auth' })
  @ApiCreatedResponse({ description: 'Connection auth created' })
  @Roles(Role.Admin)
  createConnectionAuth(@Body() createDto: CreateConnectionAuthDto, @Req() req: any): Promise<ConnectionAuth> {
    return this.shopService.createConnectionAuth(createDto, req.user)
  }

  // Implementation endpoints
  @Get('implementations')
  @ApiOperation({ summary: 'Filter implementations' })
  @ApiOkResponse({ description: 'List of implementations' })
  @Roles(Role.Admin)
  filterImplementations(@Query() queryDto: any, @Req() req: any): Observable<Pagination<any>> {
    return this.shopService.filterImplementations(queryDto, req.user)
  }

  @Get('implementations/:id')
  @ApiOperation({ summary: 'Get implementation by ID' })
  @ApiOkResponse({ description: 'Implementation details' })
  @Roles(Role.Admin)
  getImplementation(@Param('id', ParseIntPipe) id: number, @Req() req: any): Observable<any> {
    return this.shopService.getImplementation(id, req.user)
  }

  // Order endpoints
  @Get('orders/aggregated-by-status')
  @ApiOperation({ summary: 'Get orders aggregated by status' })
  @ApiOkResponse({ description: 'Orders aggregated by status' })
  @Roles(Role.Admin)
  getAggregatedByStatus(@Query('status') status: any, @Req() req: any): Observable<any> {
    return this.shopService.getAggregatedByStatus(status, req.user)
  }

  @Get('orders')
  @ApiOperation({ summary: 'Filter orders' })
  @ApiOkResponse({ description: 'List of orders' })
  @Roles(Role.Admin)
  filterOrders(@Query() queryDto: any, @Req() req: any): Observable<PaginatedResult<any>> {
    return this.shopService.filterOrders(queryDto, req.user)
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiOkResponse({ description: 'Order details' })
  @Roles(Role.Admin)
  getOrder(@Param('id', ParseIntPipe) id: number, @Req() req: any): Promise<any> {
    return this.shopService.getOrder(id, req.user)
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create order' })
  @ApiCreatedResponse({ description: 'Order created' })
  @Roles(Role.Admin)
  createOrder(@Body() createDto: any, @Req() req: any): Promise<Observable<any>> {
    return this.shopService.createOrder(createDto, req.user)
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update order' })
  @ApiOkResponse({ description: 'Order updated' })
  @Roles(Role.Admin)
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any, @Req() req: any): Observable<any> {
    return this.shopService.updateOrder(id, updateDto, req.user)
  }

  // Inventory Item endpoints
  @Get('inventory-items')
  @ApiOperation({ summary: 'Filter inventory items' })
  @ApiOkResponse({ description: 'List of inventory items' })
  @Roles(Role.Admin)
  filterInventoryItems(@Query() queryDto: any, @Req() req: any): Observable<PaginatedResult<any>> {
    return this.shopService.filterInventoryItems(queryDto, req.user)
  }

  @Get('inventory-items/:id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiOkResponse({ description: 'Inventory item details' })
  @Roles(Role.Admin)
  getInventoryItem(@Param('id', ParseIntPipe) id: number, @Req() req: any): Observable<any> {
    return this.shopService.getInventoryItem(id, req.user)
  }

  @Post('inventory-items')
  @ApiOperation({ summary: 'Create inventory item' })
  @ApiCreatedResponse({ description: 'Inventory item created' })
  @Roles(Role.Admin)
  createInventoryItem(@Body() createDto: any, @Req() req: any): Observable<any> {
    return this.shopService.createInventoryItem(createDto, req.user)
  }

  @Patch('inventory-items/:id')
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiOkResponse({ description: 'Inventory item updated' })
  @Roles(Role.Admin)
  updateInventoryItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: any,
    @Query('isInternalUpdate') isInternalUpdate: boolean = false,
    @Req() req: any
  ): Observable<any> {
    return this.shopService.updateInventoryItem(id, updateDto, isInternalUpdate, req.user)
  }

  // Inventory Bundle endpoints
  @Get('inventory-bundles')
  @ApiOperation({ summary: 'Filter inventory bundles' })
  @ApiOkResponse({ description: 'List of inventory bundles' })
  @Roles(Role.Admin)
  filterInventoryBundles(@Query() queryDto: any, @Req() req: any): Observable<PaginatedResult<any>> {
    return this.shopService.filterInventoryBundles(queryDto, req.user)
  }

  @Get('inventory-bundles/:id')
  @ApiOperation({ summary: 'Get inventory bundle by ID' })
  @ApiOkResponse({ description: 'Inventory bundle details' })
  @Roles(Role.Admin)
  getInventoryBundle(@Param('id', ParseIntPipe) id: number, @Req() req: any): Observable<any> {
    return this.shopService.getInventoryBundle(id, req.user)
  }

  @Post('inventory-bundles')
  @ApiOperation({ summary: 'Create inventory bundle' })
  @ApiCreatedResponse({ description: 'Inventory bundle created' })
  @Roles(Role.Admin)
  createInventoryBundle(@Body() createDto: any, @Req() req: any): Observable<any> {
    return this.shopService.createInventoryBundle(createDto, req.user)
  }

  // Refund Order endpoints
  @Get('refund-orders')
  @ApiOperation({ summary: 'Filter refund orders' })
  @ApiOkResponse({ description: 'List of refund orders' })
  @Roles(Role.Admin)
  filterRefundOrders(@Query() queryDto: any, @Req() req: any): Observable<PaginatedResult<any>> {
    return this.shopService.filterRefundOrders(queryDto, req.user)
  }

  @Get('refund-orders/:id')
  @ApiOperation({ summary: 'Get refund order by ID' })
  @ApiOkResponse({ description: 'Refund order details' })
  @Roles(Role.Admin)
  getRefundOrder(@Param('id', ParseIntPipe) id: number, @Req() req: any): Observable<any> {
    return this.shopService.getRefundOrder(id, req.user)
  }

  @Post('refund-orders/calculate')
  @ApiOperation({ summary: 'Calculate refund order' })
  @ApiOkResponse({ description: 'Refund order calculation' })
  @Roles(Role.Admin)
  calculateRefundOrder(@Body() refundOrderDto: any, @Req() req: any): Promise<any> {
    return this.shopService.calculateRefundOrder(refundOrderDto, req.user)
  }

  @Post('refund-orders')
  @ApiOperation({ summary: 'Create refund order' })
  @ApiCreatedResponse({ description: 'Refund order created' })
  @Roles(Role.Admin)
  createRefundOrder(@Body() refundOrderDto: any, @Req() req: any): Promise<any> {
    return this.shopService.createRefundOrder(refundOrderDto, req.user)
  }

  // Outbound Shipment endpoints
  @Get('outbound-shipments')
  @ApiOperation({ summary: 'Filter outbound shipments' })
  @ApiOkResponse({ description: 'List of outbound shipments' })
  @Roles(Role.Admin)
  filterOutboundShipments(@Query() queryDto: any, @Req() req: any): Observable<PaginatedResult<any>> {
    return this.shopService.filterOutboundShipments(queryDto, req.user)
  }

  @Get('outbound-shipments/:id')
  @ApiOperation({ summary: 'Get outbound shipment by ID' })
  @ApiOkResponse({ description: 'Outbound shipment details' })
  @Roles(Role.Admin)
  getOutboundShipment(@Param('id', ParseIntPipe) id: number, @Req() req: any): Observable<any> {
    return this.shopService.getOutboundShipment(id, req.user)
  }

  // Return Shipment endpoints
  @Get('return-shipments')
  @ApiOperation({ summary: 'Filter return shipments' })
  @ApiOkResponse({ description: 'List of return shipments' })
  @Roles(Role.Admin)
  filterReturnShipments(@Query() queryDto: any, @Req() req: any): Observable<PaginatedResult<any>> {
    return this.shopService.filterReturnShipments(queryDto, req.user)
  }

  @Get('return-shipments/:id')
  @ApiOperation({ summary: 'Get return shipment by ID' })
  @ApiOkResponse({ description: 'Return shipment details' })
  @Roles(Role.Admin)
  getReturnShipment(@Param('id', ParseIntPipe) id: number, @Req() req: any): Observable<any> {
    return this.shopService.getReturnShipment(id, req.user)
  }

  // Utility endpoints
  @Get('inventory-items/:id/shop-stock-levels')
  @ApiOperation({ summary: 'Get inventory item shop stock levels' })
  @ApiOkResponse({ description: 'Shop stock levels' })
  @Roles(Role.Admin)
  getInventoryItemShopStockLevels(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ): Promise<GetInventoryItemShopStockLevelsResponseDto> {
    return this.shopService.getInventoryItemShopStockLevels(id, req.user)
  }

  @Get('shipping-methods')
  @ApiOperation({ summary: 'Get shipping methods' })
  @ApiOkResponse({ description: 'List of shipping methods' })
  @Roles(Role.Admin)
  getShippingMethod(@Query() queryFieldMapper: QueryFieldMapper): Promise<FieldMapper[]> {
    return this.shopService.getShippingMethod(queryFieldMapper)
  }

  // Shopify specific endpoints
  @Post('shopify/integration')
  @ApiOperation({ summary: 'Create Shopify integration' })
  @ApiCreatedResponse({ description: 'Shopify integration created' })
  @Roles(Role.Admin)
  createShopifyAppConnectionAuth(
    @Body() createDto: CreateShopifyIntregrationDto,
    @Req() req: any
  ): Promise<ConnectionAuth> {
    return this.shopService.createShopifyAppConnectionAuth(createDto, req.user)
  }

  @Post('shopify/webhook')
  @ApiOperation({ summary: 'Handle Shopify webhook' })
  @ApiOkResponse({ description: 'Webhook processed' })
  handleShopifyWebhook(@Body() data: any) {
    return this.shopService.handleShopifyWebhook(data)
  }
}
