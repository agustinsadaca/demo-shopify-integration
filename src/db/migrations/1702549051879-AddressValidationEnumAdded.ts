import { MigrationInterface, QueryRunner } from "typeorm"

export class AddressValidationEnumAdded1702549051879 implements MigrationInterface {
  name = 'AddressValidationEnumAdded1702549051879'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum" RENAME TO "automation_rule_entity_enum_old"`)
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'return-request', 'trackingRequest', 'trackingResponse', 'error', 'refund-order', 'partner-location-storage-item', 'email-summary', 'report', 'connection-auth', 'cancelled-order')`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum" USING "entity"::"text"::"public"."automation_rule_entity_enum"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum_old"`)
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_action_enum" RENAME TO "automation_rule_action_enum_old"`)
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getMovements', 'getErrors', 'create', 'updateMany', 'cancel', 'open', 'getTrackingDetails', 'getDeliveredTrackingDetails', 'release', 'cancelNotification', 'returnNotification', 'trackLowStock', 'lowStockNotification', 'inboundReceiptNotification', 'handedOverNotification', 'returnLabelCreationNotification', 'generate', 'getShopDetails')`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "action" TYPE "public"."automation_rule_action_enum" USING "action"::"text"::"public"."automation_rule_action_enum"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum_old"`)
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_name_enum" RENAME TO "automation_rule_name_enum_old"`)
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_name_enum" AS ENUM('Bundle', 'ShipsWith', 'OrderDelay', 'ReturnNotification', 'OrderCancelNotification', 'InboundNotification', 'AddressValidation')`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "name" TYPE "public"."automation_rule_name_enum" USING "name"::"text"::"public"."automation_rule_name_enum"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_name_enum_old"`)
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "frequency" SET DEFAULT '0 */30 * * * *'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "frequency" SET DEFAULT '30'`)
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_name_enum_old" AS ENUM('Bundle', 'ShipsWith', 'OrderDelay', 'ReturnNotification', 'OrderCancelNotification', 'InboundNotification')`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "name" TYPE "public"."automation_rule_name_enum_old" USING "name"::"text"::"public"."automation_rule_name_enum_old"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_name_enum"`)
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_name_enum_old" RENAME TO "automation_rule_name_enum"`)
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum_old" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getMovements', 'getErrors', 'create', 'updateMany', 'cancel', 'open', 'getTrackingDetails', 'release', 'cancelNotification', 'returnNotification', 'trackLowStock', 'lowStockNotification', 'inboundReceiptNotification')`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "action" TYPE "public"."automation_rule_action_enum_old" USING "action"::"text"::"public"."automation_rule_action_enum_old"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum"`)
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_action_enum_old" RENAME TO "automation_rule_action_enum"`)
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum_old" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'return-request', 'trackingRequest', 'trackingResponse', 'error', 'refund-order', 'partner-location-storage-item', 'email-summary')`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum_old" USING "entity"::"text"::"public"."automation_rule_entity_enum_old"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum"`)
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum_old" RENAME TO "automation_rule_entity_enum"`)
  }

}
