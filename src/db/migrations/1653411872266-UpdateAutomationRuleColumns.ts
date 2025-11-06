import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateAutomationRuleColumns1653411872266 implements MigrationInterface {
  name = 'UpdateAutomationRuleColumns1653411872266'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_rule" DROP COLUMN "trigger"`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ADD "is_active" boolean NOT NULL DEFAULT true`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_rule" DROP COLUMN "is_active"`)
    await queryRunner.query(`ALTER TABLE "automation_rule" ADD "trigger" character varying NOT NULL`)
  }

}
