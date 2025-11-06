import { MigrationInterface, QueryRunner } from "typeorm"

export class AddFulfillmentTrainInConnectionAuth1671044739929 implements MigrationInterface {
  name = 'AddFulfillmentTrainInConnectionAuth1671044739929'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "connection_auth" ADD "fulfillment_train" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "fulfillment_train"`)
  }

}
