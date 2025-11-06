import {MigrationInterface, QueryRunner} from "typeorm";

export class MetaInfoColumConnectionAuth1645620643482 implements MigrationInterface {
    name = 'MetaInfoColumConnectionAuth1645620643482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" ADD "meta_info" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "meta_info"`);
    }

}
