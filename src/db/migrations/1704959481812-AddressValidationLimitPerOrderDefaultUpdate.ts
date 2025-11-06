import { MigrationInterface, QueryRunner } from "typeorm"

export class AddressValidationLimitPerOrderDefaultUpdate1704959481812 implements MigrationInterface {
  name = 'AddressValidationLimitPerOrderDefaultUpdate1704959481812'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "address_validation" ALTER COLUMN "limit_per_month" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "address_validation" ALTER COLUMN "limit_per_month" SET DEFAULT '1000'`)
    await queryRunner.query(`ALTER TABLE "address_validation" ALTER COLUMN "limit_per_order" SET DEFAULT '10'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "address_validation" ALTER COLUMN "limit_per_order" SET DEFAULT '25'`)
    await queryRunner.query(`ALTER TABLE "address_validation" ALTER COLUMN "limit_per_month" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "address_validation" ALTER COLUMN "limit_per_month" DROP NOT NULL`)
  }

}
