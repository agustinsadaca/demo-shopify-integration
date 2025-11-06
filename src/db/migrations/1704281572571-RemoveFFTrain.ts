import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFFTrain1704281572571 implements MigrationInterface {
    name = 'RemoveFFTrain1704281572571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "fulfillment_train"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" ADD "fulfillment_train" jsonb`);
    }

}
