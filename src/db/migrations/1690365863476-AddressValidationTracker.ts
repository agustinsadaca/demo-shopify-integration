import { MigrationInterface, QueryRunner } from "typeorm"

export class AddressValidationTracker1690365863476 implements MigrationInterface {
  name = 'AddressValidationTracker1690365863476'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."address_validation_tracker_status_enum" AS ENUM('valid', 'invalid')`)
    await queryRunner.query(`CREATE TYPE "public"."address_validation_tracker_actions_enum" AS ENUM('auto-fixed', 'accepted', 'ignored', 'manually-changed')`)
    await queryRunner.query(`CREATE TABLE "address_validation_tracker" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "implementation_id" integer NOT NULL, "entity_type" character varying NOT NULL, "entity_id" integer NOT NULL, "context" character varying NOT NULL, "google_validation_response" jsonb NOT NULL, "status" "public"."address_validation_tracker_status_enum" NOT NULL, "reasons" character varying array DEFAULT '{}', "actions" "public"."address_validation_tracker_actions_enum", "recommendations" jsonb, "original_address" jsonb NOT NULL, "updated_address" jsonb, CONSTRAINT "PK_a2146f74ea872e3bdb22ab67336" PRIMARY KEY ("id"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "address_validation_tracker"`)
    await queryRunner.query(`DROP TYPE "public"."address_validation_tracker_actions_enum"`)
    await queryRunner.query(`DROP TYPE "public"."address_validation_tracker_status_enum"`)
  }

}
