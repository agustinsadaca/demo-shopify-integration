import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateCarrierAuth1661265731852 implements MigrationInterface {
  name = 'CreateCarrierAuth1661265731852'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."carrier_auth_target_system_enum" AS ENUM('dhl')`)
    await queryRunner.query(`CREATE TYPE "public"."carrier_auth_provided_by_enum" AS ENUM('shop', 'wms')`)
    await queryRunner.query(`CREATE TABLE "carrier_auth" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "target_system" "public"."carrier_auth_target_system_enum" NOT NULL, "connection_url" character varying NOT NULL, "auth_object" jsonb NOT NULL, "auth_strategy" character varying NOT NULL, "implementation_id" integer NOT NULL, "provided_by" "public"."carrier_auth_provided_by_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "meta_info" jsonb, CONSTRAINT "PK_562975f7a39983824b17d48226b" PRIMARY KEY ("id"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "carrier_auth"`)
    await queryRunner.query(`DROP TYPE "public"."carrier_auth_provided_by_enum"`)
    await queryRunner.query(`DROP TYPE "public"."carrier_auth_target_system_enum"`)
  }

}
