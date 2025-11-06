import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOrdeDelayAutomation1704353016176 implements MigrationInterface {
    name = 'RemoveOrdeDelayAutomation1704353016176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_name_enum" RENAME TO "automation_rule_name_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_name_enum" AS ENUM('Bundle', 'ShipsWith', 'ReturnNotification', 'OrderCancelNotification', 'InboundNotification', 'AddressValidation')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "name" TYPE "public"."automation_rule_name_enum" USING "name"::"text"::"public"."automation_rule_name_enum"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_name_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_name_enum_old" AS ENUM('Bundle', 'ShipsWith', 'OrderDelay', 'ReturnNotification', 'OrderCancelNotification', 'InboundNotification', 'AddressValidation')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "name" TYPE "public"."automation_rule_name_enum_old" USING "name"::"text"::"public"."automation_rule_name_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_name_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_name_enum_old" RENAME TO "automation_rule_name_enum"`);
    }

}
