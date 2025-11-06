import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetaInfoInAutomationRule1681887052883 implements MigrationInterface {
    name = 'AddMetaInfoInAutomationRule1681887052883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "automation_rule" ADD "meta_info" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "automation_rule" DROP COLUMN "meta_info"`);
    }

}
