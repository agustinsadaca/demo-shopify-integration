import { MigrationInterface, QueryRunner } from "typeorm"

export class TargetTypesAndSystemToString1640075018596 implements MigrationInterface {
  name = 'TargetTypesAndSystemToString1640075018596'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMIT`)
    await queryRunner.query(`ALTER TYPE connection_auth_target_system_enum ADD VALUE IF NOT EXISTS 'tm3'`)
    await queryRunner.query(`ALTER TYPE connection_auth_target_system_enum ADD VALUE IF NOT EXISTS 'ebay'`)
    await queryRunner.query(`ALTER TYPE connection_auth_target_system_enum ADD VALUE IF NOT EXISTS 'sigloch'`)
    await queryRunner.query(`ALTER TYPE connection_auth_target_system_enum ADD VALUE IF NOT EXISTS 'woocommerce'`)
    await queryRunner.query(`ALTER TYPE connection_auth_target_system_enum ADD VALUE IF NOT EXISTS 'magento'`)

    await queryRunner.query(`CREATE TYPE "public"."sync_preference_target_enum" AS ENUM('shop', 'wms')`)
    await queryRunner.query(`ALTER TABLE "sync_preference" ALTER COLUMN "target" TYPE "public"."sync_preference_target_enum" USING "target"::"text"::"public"."sync_preference_target_enum"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
