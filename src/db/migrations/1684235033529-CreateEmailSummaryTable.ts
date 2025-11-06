import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailSummaryTable1684235033529 implements MigrationInterface {
  name = 'CreateEmailSummaryTable1684235033529'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "email_summary" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entity" character varying NOT NULL, "action" character varying NOT NULL, "implementation_id" integer NOT NULL, "notification_type" character varying(55) NOT NULL, "entity_value" jsonb, CONSTRAINT "UQ_bafc75c242f6be4637496d2014e" UNIQUE ("entity", "action", "implementation_id"), CONSTRAINT "PK_5eee0f4afe0dfc366e97983b82b" PRIMARY KEY ("id")); COMMENT ON COLUMN "email_summary"."entity_value" IS 'key will be the id of entity used in url and value will be the title of that url'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_summary"`);
  }

}
