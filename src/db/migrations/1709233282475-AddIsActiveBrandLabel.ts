import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIsActiveBrandLabel1709233282475 implements MigrationInterface {
  name = 'AddIsActiveBrandLabel1709233282475'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brand_label" ADD "is_active" boolean NOT NULL DEFAULT true`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brand_label" DROP COLUMN "is_active"`)
  }

}
