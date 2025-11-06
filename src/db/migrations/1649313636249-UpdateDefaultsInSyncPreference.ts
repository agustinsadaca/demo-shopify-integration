import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateDefaultsInSyncPreference1649313636249 implements MigrationInterface {
  name = 'UpdateDefaultsInSyncPreference1649313636249'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "frequency_in_minutes" SET DEFAULT '30'`)
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "last_ran_at" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "last_ran_at" DROP DEFAULT`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "last_ran_at" SET DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "last_ran_at" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "frequency_in_minutes" SET DEFAULT '0'`)
  }

}
