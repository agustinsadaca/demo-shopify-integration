import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAutomationEnum1684235608113 implements MigrationInterface {
  name = 'UpdateAutomationEnum1684235608113'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum" RENAME TO "automation_rule_entity_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'return-request', 'trackingRequest', 'trackingResponse', 'error', 'refund-order', 'partner-location-storage-item', 'email-summary')`);
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum" USING "entity"::"text"::"public"."automation_rule_entity_enum"`);
    await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum_old"`);
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_action_enum" RENAME TO "automation_rule_action_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getMovements', 'getErrors', 'create', 'updateMany', 'cancel', 'open', 'getTrackingDetails', 'release', 'cancelNotification', 'returnNotification', 'trackLowStock', 'lowStockNotification', 'inboundReceiptNotification')`);
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "action" TYPE "public"."automation_rule_action_enum" USING "action"::"text"::"public"."automation_rule_action_enum"`);
    await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum_old" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getMovements', 'getErrors', 'create', 'updateMany', 'cancel', 'open', 'lowStockNotification', 'getTrackingDetails', 'release')`);
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "action" TYPE "public"."automation_rule_action_enum_old" USING "action"::"text"::"public"."automation_rule_action_enum_old"`);
    await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_action_enum_old" RENAME TO "automation_rule_action_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum_old" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'return-request', 'trackingRequest', 'trackingResponse', 'error', 'refund-order', 'partner-location-storage-item')`);
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum_old" USING "entity"::"text"::"public"."automation_rule_entity_enum_old"`);
    await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum_old" RENAME TO "automation_rule_entity_enum"`);
  }

}
