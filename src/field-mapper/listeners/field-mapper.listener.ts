import { JwtUser, UpdateOrdersMetaInfoIsShippingMethodUnknownDto } from '../../core/types/common.types'
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { lastValueFrom } from 'rxjs'
import { AfterSaveEvent } from '../../core/interfaces/after-save-event.interface'
import { OrdersService } from '../../orders/orders.service'
import { ShopServiceMapperFields } from '../../shop-connectors/shop-connectors.service'
import { FieldMapper } from '../entities/field-mapper.entity'
import { FieldMapperEntityTypesEnum } from '../enums/entity-types.enum'

@Injectable()
export class FieldMapperListener {
  private readonly logger = new Logger(FieldMapperListener.name)
  constructor(
    @Inject(forwardRef(() => OrdersService)) private ordersService: OrdersService,
  ) { }

  @OnEvent('field_mapper.after_save')
  async handleOrderAfterSaveEvent(event: AfterSaveEvent<FieldMapper>) {
    try {
      if (event.created) {
        await this.handleFieldMapperAfterCreateEvent(event.created, event.user)
      }

      if (event.updated) {
        await this.handleFieldMapperAfterUpdateEvent(event.updated, event.user)
      }
    }
    catch (err) {
      this.logger.error(err, err?.stack)
    }
  }

  async handleFieldMapperAfterCreateEvent(fieldMapper: FieldMapper, user: JwtUser) {
    try {
      await this.handleOrderShippingMethodFieldMapper(fieldMapper, user)
    } catch (err) {
      throw err
    }
  }

  async handleFieldMapperAfterUpdateEvent(fieldMapper: FieldMapper, user: JwtUser) {
    try {
      await this.handleOrderShippingMethodFieldMapper(fieldMapper, user)
    } catch (err) {
      throw err
    }
  }

  async handleOrderShippingMethodFieldMapper(fieldMapper: FieldMapper, user: JwtUser) {
    try {
      const isOrderShippingMethod = fieldMapper?.entityType === FieldMapperEntityTypesEnum.order && fieldMapper?.entityField === ShopServiceMapperFields.shippingMethod
      if (!isOrderShippingMethod) { return }
      await this.updateOrdersMetaInfoIsShippingMethodUnknown(fieldMapper, user)
    } catch (err) {
      throw err
    }
  }

  async updateOrdersMetaInfoIsShippingMethodUnknown(fieldMapper: FieldMapper, user: JwtUser) {
    try {
      const updateOrdersMetaInfoIsShippingMethodUnknownDto: UpdateOrdersMetaInfoIsShippingMethodUnknownDto = {
        implementationId: fieldMapper.implementationId,
        isDefault: fieldMapper.isDefault,
        shippingMethod: fieldMapper.shopValue
      }
      await lastValueFrom(this.ordersService.updateOrdersMetaInfoIsShippingMethodUnknown(updateOrdersMetaInfoIsShippingMethodUnknownDto as any, user))
    } catch (err) {
      throw err
    }
  }

}