import { MigrationInterface, QueryRunner } from "typeorm"

export class AddReturnRequestInEntityEnum1665124007090 implements MigrationInterface {
  name = 'AddReturnRequestInEntityEnum1665124007090'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum" RENAME TO "automation_rule_entity_enum_old"`)
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'returnRequest', 'error')`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum" USING "entity"::"text"::"public"."automation_rule_entity_enum"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum_old"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum_old" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'returnShipmentRequest', 'error')`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum_old" USING "entity"::"text"::"public"."automation_rule_entity_enum_old"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum"`)
    await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum_old" RENAME TO "automation_rule_entity_enum"`)
  }

}
