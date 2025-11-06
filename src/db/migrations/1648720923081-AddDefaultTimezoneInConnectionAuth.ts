import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDefaultTimezoneInConnectionAuth1648720923081 implements MigrationInterface {
    name = 'AddDefaultTimezoneInConnectionAuth1648720923081'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" ADD "default_timezone" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "default_timezone"`);
    }

}
