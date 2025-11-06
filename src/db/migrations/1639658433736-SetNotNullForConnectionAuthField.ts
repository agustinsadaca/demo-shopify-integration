import { MigrationInterface, QueryRunner } from "typeorm"

export class SetNotNullForConnectionAuthField1639658433736 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."connection_auth" ALTER "target_type_id" SET NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."connection_auth" ALTER "target_type_id" DROP NOT NULL`)
  }

}
