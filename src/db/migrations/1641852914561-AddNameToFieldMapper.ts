import { MigrationInterface, QueryRunner } from "typeorm"

export class AddNameToFieldMapper1641852914561 implements MigrationInterface {
  name = 'AddNameToFieldMapper1641852914561'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "field_mapper" ADD "name" character varying NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "field_mapper" DROP COLUMN "name"`)
  }

}
