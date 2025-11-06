import {MigrationInterface, QueryRunner} from "typeorm";

export class TargetSystemConnectionIdColumn1641294541182 implements MigrationInterface {
    name = 'TargetSystemConnectionIdColumn1641294541182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sync_preference" DROP CONSTRAINT "pref_constraint"`);
        await queryRunner.query(`ALTER TABLE "connection_auth" ADD "target_system_connection_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "target_system_connection_id"`);
        await queryRunner.query(`ALTER TABLE "sync_preference" ADD CONSTRAINT "pref_constraint" UNIQUE ("implementation_id", "action", "entity", "target")`);
    }

}
