import { MigrationInterface, QueryRunner } from "typeorm"

export class NameColumnInAutomation1656914878998 implements MigrationInterface {
  name = 'NameColumnInAutomation1656914878998'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_rule" ADD "name" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_rule" DROP COLUMN "name"`)
  }

}
