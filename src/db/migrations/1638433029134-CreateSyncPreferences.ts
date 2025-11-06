import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateSyncPreferences1638433029134 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`CREATE TABLE "sync_preference" ("id" SERIAL NOT NULL, "implementation_id" integer NOT NULL, "action" character varying NOT NULL, "entity" character varying NOT NULL, "target" "public"."connection_auth_target_type_enum" NOT NULL, "frequency_in_minutes" integer NOT NULL DEFAULT 0, "is_active" boolean NOT NULL DEFAULT true, "last_ran_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_354be13e3a6b6bc6a9020cd83b1" PRIMARY KEY ("id"), CONSTRAINT pref_constraint unique ("implementation_id", "action", "entity", "target"))`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP TABLE "sync_preference"`)
    }

}
