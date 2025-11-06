import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIsConfigurableAutomationRule1716810683700 implements MigrationInterface {
  name = 'AddIsConfigurableAutomationRule1716810683700'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_rule" ADD "is_configurable" boolean NOT NULL DEFAULT false`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_rule" DROP COLUMN "is_configurable"`)
  }

}
