import { MigrationInterface, QueryRunner } from "typeorm"

export class AddBillbeeTargetSystemEnum1645180962878 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE connection_auth_target_system_enum ADD VALUE IF NOT EXISTS 'billbee'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
