import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateAddressValidation1700836480483 implements MigrationInterface {
  name = 'UpdateAddressValidation1700836480483'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "address_validation" DROP COLUMN "limt_per_month"`)
    await queryRunner.query(`ALTER TABLE "address_validation" DROP COLUMN "limt_per_day"`)
    await queryRunner.query(`ALTER TABLE "address_validation" DROP COLUMN "limt_per_order"`)
    await queryRunner.query(`ALTER TABLE "address_validation" ADD "limit_per_month" integer`)
    await queryRunner.query(`ALTER TABLE "address_validation" ADD "limit_per_day" integer`)
    await queryRunner.query(`ALTER TABLE "address_validation" ADD "limit_per_order" integer NOT NULL DEFAULT '25'`)
    await queryRunner.query(`ALTER TABLE "address_validation" ADD "automatic_correction" boolean NOT NULL DEFAULT false`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "address_validation" DROP COLUMN "automatic_correction"`)
    await queryRunner.query(`ALTER TABLE "address_validation" DROP COLUMN "limit_per_order"`)
    await queryRunner.query(`ALTER TABLE "address_validation" DROP COLUMN "limit_per_day"`)
    await queryRunner.query(`ALTER TABLE "address_validation" DROP COLUMN "limit_per_month"`)
    await queryRunner.query(`ALTER TABLE "address_validation" ADD "limt_per_order" integer NOT NULL DEFAULT '25'`)
    await queryRunner.query(`ALTER TABLE "address_validation" ADD "limt_per_day" integer`)
    await queryRunner.query(`ALTER TABLE "address_validation" ADD "limt_per_month" integer`)
  }

}
