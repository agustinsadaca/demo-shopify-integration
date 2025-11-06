import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetaInfoInBrandLabel1692872449747 implements MigrationInterface {
    name = 'AddMetaInfoInBrandLabel1692872449747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand_label" ADD "meta_info" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand_label" DROP COLUMN "meta_info"`);
    }

}
