import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIsDefaultInFieldMapper1676532932959 implements MigrationInterface {
  name = 'AddIsDefaultInFieldMapper1676532932959'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "field_mapper" ADD "is_default" boolean NOT NULL DEFAULT false`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "field_mapper" DROP COLUMN "is_default"`)
  }

}
