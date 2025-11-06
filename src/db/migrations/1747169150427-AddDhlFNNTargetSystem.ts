import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDhlFNNTargetSystem1747169150427 implements MigrationInterface {
  name = 'AddDhlFNNTargetSystem1747169150427'

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`ALTER TYPE "public"."connection_auth_target_system_enum" RENAME TO "connection_auth_target_system_enum_old"`)
    await queryRunner.query(`CREATE TYPE "public"."connection_auth_target_system_enum" AS ENUM('sca', 'tm3', 'xentral', 'amazon_seller', 'ebay', 'sigloch', 'jtl', 'shopify', 'woocommerce', 'magento', 'billbee', 'shopware', 'dhl_ffn')`)
    await queryRunner.query(`ALTER TABLE "connection_auth" ALTER COLUMN "target_system" TYPE "public"."connection_auth_target_system_enum" USING "target_system"::"text"::"public"."connection_auth_target_system_enum"`)
    await queryRunner.query(`DROP TYPE "public"."connection_auth_target_system_enum_old"`)

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."connection_auth_target_system_enum_old" AS ENUM('sca', 'tm3', 'xentral', 'amazon_seller', 'ebay', 'sigloch', 'jtl', 'shopify', 'woocommerce', 'magento', 'billbee', 'shopware')`)
    await queryRunner.query(`ALTER TABLE "connection_auth" ALTER COLUMN "target_system" TYPE "public"."connection_auth_target_system_enum_old" USING "target_system"::"text"::"public"."connection_auth_target_system_enum_old"`)
    await queryRunner.query(`DROP TYPE "public"."connection_auth_target_system_enum"`)
    await queryRunner.query(`ALTER TYPE "public"."connection_auth_target_system_enum_old" RENAME TO "connection_auth_target_system_enum"`)

  }

}
