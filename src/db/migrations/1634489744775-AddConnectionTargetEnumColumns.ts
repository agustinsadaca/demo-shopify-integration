import {MigrationInterface, QueryRunner} from "typeorm";

export class AddConnectionTargetEnumColumns1634489744775 implements MigrationInterface {
    name = 'AddConnectionTargetEnumColumns1634489744775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."connection_auth_target_type_enum" AS ENUM('shop', 'wms')`);
        await queryRunner.query(`ALTER TABLE "public"."connection_auth" ADD "target_type" "public"."connection_auth_target_type_enum" NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."connection_auth_target_system_enum" AS ENUM('sca', 'xentral', 'shopify', 'amazon_seller')`);
        await queryRunner.query(`ALTER TABLE "public"."connection_auth" ADD "target_system" "public"."connection_auth_target_system_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."connection_auth" DROP COLUMN "target_system"`);
        await queryRunner.query(`DROP TYPE "public"."connection_auth_target_system_enum"`);
        await queryRunner.query(`ALTER TABLE "public"."connection_auth" DROP COLUMN "target_type"`);
        await queryRunner.query(`DROP TYPE "public"."connection_auth_target_type_enum"`);
    }

}
