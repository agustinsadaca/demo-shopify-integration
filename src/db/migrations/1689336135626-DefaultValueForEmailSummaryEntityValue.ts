import { MigrationInterface, QueryRunner } from "typeorm"

export class DefaultValueForEmailSummaryEntityValue1689336135626 implements MigrationInterface {
  name = 'DefaultValueForEmailSummaryEntityValue1689336135626'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "email_summary" ALTER COLUMN "entity_value" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "email_summary" ALTER COLUMN "entity_value" SET DEFAULT '{}'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "email_summary" ALTER COLUMN "entity_value" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "email_summary" ALTER COLUMN "entity_value" DROP NOT NULL`)
  }

}
