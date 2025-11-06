import { MigrationInterface, QueryRunner } from "typeorm";

export class NewOrgTypeAdded1673427149434 implements MigrationInterface {
    name = 'NewOrgTypeAdded1673427149434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."carrier_auth_provided_by_enum" RENAME TO "carrier_auth_provided_by_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."carrier_auth_provided_by_enum" AS ENUM('shop', 'wms', 'carrier', 'wms-third-party-integration')`);
        await queryRunner.query(`ALTER TABLE "carrier_auth" ALTER COLUMN "provided_by" TYPE "public"."carrier_auth_provided_by_enum" USING "provided_by"::"text"::"public"."carrier_auth_provided_by_enum"`);
        await queryRunner.query(`DROP TYPE "public"."carrier_auth_provided_by_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."connection_auth_target_type_enum" RENAME TO "connection_auth_target_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."connection_auth_target_type_enum" AS ENUM('shop', 'wms', 'carrier', 'wms-third-party-integration')`);
        await queryRunner.query(`ALTER TABLE "connection_auth" ALTER COLUMN "target_type" TYPE "public"."connection_auth_target_type_enum" USING "target_type"::"text"::"public"."connection_auth_target_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."connection_auth_target_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."sync_preference_target_enum" RENAME TO "sync_preference_target_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sync_preference_target_enum" AS ENUM('shop', 'wms', 'carrier', 'wms-third-party-integration')`);
        await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "target" TYPE "public"."sync_preference_target_enum" USING "target"::"text"::"public"."sync_preference_target_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sync_preference_target_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_target_type_enum" RENAME TO "automation_rule_target_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_target_type_enum" AS ENUM('shop', 'wms', 'carrier', 'wms-third-party-integration')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "target_type" TYPE "public"."automation_rule_target_type_enum" USING "target_type"::"text"::"public"."automation_rule_target_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_target_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum" RENAME TO "automation_rule_entity_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'return-request', 'trackingRequest', 'trackingResponse', 'error', 'refund-order')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum" USING "entity"::"text"::"public"."automation_rule_entity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_action_enum" RENAME TO "automation_rule_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getMovements', 'getErrors', 'create', 'updateMany', 'cancel', 'open', 'lowStockNotification', 'getTrackingDetails', 'release')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "action" TYPE "public"."automation_rule_action_enum" USING "action"::"text"::"public"."automation_rule_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum_old" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getMovements', 'getErrors', 'create', 'updateMany', 'cancel', 'open', 'lowStockNotification', 'getTrackingDetails')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "action" TYPE "public"."automation_rule_action_enum_old" USING "action"::"text"::"public"."automation_rule_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_action_enum_old" RENAME TO "automation_rule_action_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum_old" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'returnRequest', 'trackingRequest', 'trackingResponse', 'error')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum_old" USING "entity"::"text"::"public"."automation_rule_entity_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum_old" RENAME TO "automation_rule_entity_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_target_type_enum_old" AS ENUM('shop', 'wms', 'carrier')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "target_type" TYPE "public"."automation_rule_target_type_enum_old" USING "target_type"::"text"::"public"."automation_rule_target_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_target_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_target_type_enum_old" RENAME TO "automation_rule_target_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."sync_preference_target_enum_old" AS ENUM('shop', 'wms', 'carrier')`);
        await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "target" TYPE "public"."sync_preference_target_enum_old" USING "target"::"text"::"public"."sync_preference_target_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."sync_preference_target_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sync_preference_target_enum_old" RENAME TO "sync_preference_target_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."connection_auth_target_type_enum_old" AS ENUM('shop', 'wms', 'carrier')`);
        await queryRunner.query(`ALTER TABLE "connection_auth" ALTER COLUMN "target_type" TYPE "public"."connection_auth_target_type_enum_old" USING "target_type"::"text"::"public"."connection_auth_target_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."connection_auth_target_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."connection_auth_target_type_enum_old" RENAME TO "connection_auth_target_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."carrier_auth_provided_by_enum_old" AS ENUM('shop', 'wms', 'carrier')`);
        await queryRunner.query(`ALTER TABLE "carrier_auth" ALTER COLUMN "provided_by" TYPE "public"."carrier_auth_provided_by_enum_old" USING "provided_by"::"text"::"public"."carrier_auth_provided_by_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."carrier_auth_provided_by_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."carrier_auth_provided_by_enum_old" RENAME TO "carrier_auth_provided_by_enum"`);
    }

}
