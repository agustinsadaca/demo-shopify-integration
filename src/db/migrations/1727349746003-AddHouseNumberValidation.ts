import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHouseNumberValidation1727349746003 implements MigrationInterface {
    name = 'AddHouseNumberValidation1727349746003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address_validation" ADD "check_house_number" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address_validation" DROP COLUMN "check_house_number"`);
    }

}
