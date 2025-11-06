import { MigrationInterface, QueryRunner } from "typeorm"

export class AddCustomerValidationEntity1688384919129 implements MigrationInterface {
  name = 'AddCustomerValidationEntity1688384919129'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "address_validation" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "implementation_id" integer NOT NULL, "check_shipping_address" boolean NOT NULL DEFAULT false, "check_billing_address" boolean NOT NULL DEFAULT false, "limt_per_month" integer, "limt_per_day" integer, "limt_per_order" integer NOT NULL DEFAULT '25', CONSTRAINT "UQ_ca4e4d5466d65d438db9a3b5352" UNIQUE ("implementation_id"), CONSTRAINT "PK_3a26eeb6e51468552fd9f3fc680" PRIMARY KEY ("id"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "address_validation"`)
  }

}
