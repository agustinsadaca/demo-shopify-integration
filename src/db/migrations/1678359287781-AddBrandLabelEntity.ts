import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBrandLabelEntity1678359287781 implements MigrationInterface {
    name = 'AddBrandLabelEntity1678359287781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "brand_label" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "implementation_id" integer NOT NULL, "domain" character varying NOT NULL, "logo_img_url" character varying, "banner_img_url" character varying, "background_img_url" character varying, "favicon_img_url" character varying, "primary_color" character varying, "secondary_color" character varying, "tag_line" character varying, "label_type" character varying NOT NULL, CONSTRAINT "PK_67e7311934be8a875a070362e5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b948a2888a433b662b0e001b63" ON "brand_label" ("implementation_id", "domain") `);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum" RENAME TO "automation_rule_entity_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'return-request', 'trackingRequest', 'trackingResponse', 'error', 'refund-order', 'partner-location-storage-item')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum" USING "entity"::"text"::"public"."automation_rule_entity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_entity_enum_old" AS ENUM('order', 'inventory-item', 'partner-location-inventory-item', 'order-item', 'outbound-shipment', 'outbound-shipment-item', 'return-shipment', 'return-shipment-item', 'inventory-level', 'inbound-notice', 'inbound-receipt', 'return-request', 'trackingRequest', 'trackingResponse', 'error', 'refund-order')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "entity" TYPE "public"."automation_rule_entity_enum_old" USING "entity"::"text"::"public"."automation_rule_entity_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_entity_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_entity_enum_old" RENAME TO "automation_rule_entity_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b948a2888a433b662b0e001b63"`);
        await queryRunner.query(`DROP TABLE "brand_label"`);
    }

}
