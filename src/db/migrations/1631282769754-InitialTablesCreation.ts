import { MigrationInterface, QueryRunner } from "typeorm"

export class InitialTablesCreation1631282769754 implements MigrationInterface {
  name = 'InitialTablesCreation1631282769754'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "connection_auth" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "connection_url" character varying NOT NULL, "auth_object" jsonb, "auth_strategy" character varying NOT NULL, "implementation_id" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_354be13e3a6b6bc6a9020cd83b9" PRIMARY KEY ("id"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "connection_auth"`)
  }

}
