import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFulfillmentTrainToJsonb1682922504545 implements MigrationInterface {
    name = 'UpdateFulfillmentTrainToJsonb1682922504545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "fulfillment_train"`);
        await queryRunner.query(`ALTER TABLE "connection_auth" ADD "fulfillment_train" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "fulfillment_train"`);
        await queryRunner.query(`ALTER TABLE "connection_auth" ADD "fulfillment_train" character varying`);
    }

}
