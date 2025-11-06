import { MigrationInterface, QueryRunner } from "typeorm"

export class AddTargetTypeIdInConnectionAuth1638353498320 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."connection_auth" ADD "target_type_id" INTEGER`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."connection_auth" DROP COLUMN "target_type_id"`)
  }

}
