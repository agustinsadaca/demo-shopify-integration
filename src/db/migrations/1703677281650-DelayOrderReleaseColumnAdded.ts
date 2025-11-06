import { MigrationInterface, QueryRunner } from "typeorm"

export class DelayOrderReleaseColumnAdded1703677281650 implements MigrationInterface {
  name = 'DelayOrderReleaseColumnAdded1703677281650'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "connection_auth" ADD "delay_order_release_in_minutes" integer`)
    await queryRunner.query(`COMMENT ON COLUMN "connection_auth"."delay_order_release_in_minutes" IS 'delay order release in minutes'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "connection_auth"."delay_order_release_in_minutes" IS 'delay order release in minutes'`)
    await queryRunner.query(`ALTER TABLE "connection_auth" DROP COLUMN "delay_order_release_in_minutes"`)
  }

}
