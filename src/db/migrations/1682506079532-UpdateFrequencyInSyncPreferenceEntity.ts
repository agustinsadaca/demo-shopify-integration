import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFrequencyInSyncPreferenceEntity1682506079532 implements MigrationInterface {
    name = 'UpdateFrequencyInSyncPreferenceEntity1682506079532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sync_preference" RENAME COLUMN "frequency_in_minutes" TO "frequency"`);
        await queryRunner.query(`ALTER TABLE "sync_preference" DROP COLUMN "frequency"`);
        await queryRunner.query(`ALTER TABLE "sync_preference" ADD "frequency" character varying NOT NULL DEFAULT '30'`);
        await queryRunner.query(`COMMENT ON COLUMN "sync_preference"."frequency" IS 'cron expression, for eg: 0 * */2 * * *, related with lastRanAt to evaluate next execution time'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "sync_preference"."frequency" IS 'cron expression, for eg: 0 * */2 * * *, related with lastRanAt to evaluate next execution time'`);
        await queryRunner.query(`ALTER TABLE "sync_preference" DROP COLUMN "frequency"`);
        await queryRunner.query(`ALTER TABLE "sync_preference" ADD "frequency" integer NOT NULL DEFAULT '30'`);
        await queryRunner.query(`ALTER TABLE "sync_preference" RENAME COLUMN "frequency" TO "frequency_in_minutes"`);
    }

}
