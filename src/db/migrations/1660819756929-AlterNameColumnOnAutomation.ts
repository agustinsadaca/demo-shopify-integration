import { MigrationInterface, QueryRunner } from "typeorm"

export class AlterNameColumnOnAutomation1660819756929 implements MigrationInterface {
  name = 'AlterNameColumnOnAutomation1660819756929'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."automation_rule_name_enum" AS ENUM('Bundle', 'ShipsWith', 'OrderDelay', 'ReturnNotification', 'OrderCancelNotification', 'InboundNotification')`)
    await queryRunner.query(`ALTER TABLE "public"."automation_rule" ALTER COLUMN "name" TYPE "public"."automation_rule_name_enum" USING "name"::"public"."automation_rule_name_enum", ALTER COLUMN "name" SET NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_rule" DROP COLUMN "name"`)
    await queryRunner.query(`DROP TYPE "public"."automation_rule_name_enum"`)
  }

}
