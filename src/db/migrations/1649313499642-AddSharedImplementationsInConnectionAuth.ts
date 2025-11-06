import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSharedImplementationsInConnectionAuth1649313499642 implements MigrationInterface {
    name = 'AddSharedImplementationsInConnectionAuth1649313499642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" ADD "shared_implementations" integer array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "shared_implementations"`);
    }

}
