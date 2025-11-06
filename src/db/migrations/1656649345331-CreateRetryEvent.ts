import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateRetryEvent1656649345331 implements MigrationInterface {
  name = 'CreateRetryEvent1656649345331'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."retry_event_status_enum" AS ENUM('open', 'processing', 'completed', 'dead')`)
    await queryRunner.query(`CREATE TABLE "retry_event" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entity" character varying NOT NULL, "action" character varying NOT NULL, "target" character varying NOT NULL, "implementation_id" integer NOT NULL, "target_type_id" integer NOT NULL, "data" jsonb, "max_allowed_retry" integer NOT NULL, "retry_count" integer, "status" "public"."retry_event_status_enum" NOT NULL, "next_retry_time" TIMESTAMP WITH TIME ZONE, "retry_reason" character varying, CONSTRAINT "PK_0506e5481b014cd4681aa1583e1" PRIMARY KEY ("id"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "retry_event"`)
    await queryRunner.query(`DROP TYPE "public"."retry_event_status_enum"`)
  }

}
