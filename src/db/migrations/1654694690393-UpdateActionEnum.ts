import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateActionEnum1654694690393 implements MigrationInterface {
    name = 'UpdateActionEnum1654694690393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_action_enum" RENAME TO "automation_rule_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getMovements', 'getErrors', 'create', 'updateMany', 'cancel', 'open')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "action" TYPE "public"."automation_rule_action_enum" USING "action"::"text"::"public"."automation_rule_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."automation_rule_action_enum_old" AS ENUM('getMany', 'getManyConfirmed', 'getManyCancelled', 'getErrors', 'create', 'updateMany', 'cancel', 'open')`);
        await queryRunner.query(`ALTER TABLE "automation_rule" ALTER COLUMN "action" TYPE "public"."automation_rule_action_enum_old" USING "action"::"text"::"public"."automation_rule_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."automation_rule_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."automation_rule_action_enum_old" RENAME TO "automation_rule_action_enum"`);
    }

}
