import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateAutomationRule1651756044315 implements MigrationInterface {
    name = 'CreateAutomationRule1651756044315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_target_type_enum" AS ENUM('shop', 'wms')`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'error')`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getErrors', 'create', 'updateMany', 'cancel', 'open')`);
        await queryRunner.query(`CREATE TABLE "automation_rule" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "implementation_id" integer NOT NULL, "trigger" character varying NOT NULL, "target_type" "public"."automation_rule_target_type_enum" NOT NULL, "entity" "public"."automation_rule_entity_enum" NOT NULL, "action" "public"."automation_rule_action_enum" NOT NULL, "rules" jsonb NOT NULL, CONSTRAINT "PK_d14a83a866da7ebbc991d3b2e9c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "automation_rule"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_target_type_enum"`);
    }

}
