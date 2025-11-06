import { MigrationInterface, QueryRunner } from "typeorm"

export class AddAnnouncementTargetEntity1708584531046 implements MigrationInterface {
  name = 'AddAnnouncementTargetEntity1708584531046'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "announcement_target" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "implementation_id" integer NOT NULL, "announcement_id" integer NOT NULL, "has_been_read" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_d29b70876a08b748c2a412cae14" PRIMARY KEY ("id"))`)
    await queryRunner.query(`ALTER TABLE "announcement_target" ADD CONSTRAINT "FK_d1b99d22725c12f08ec4280d659" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "announcement_target" DROP CONSTRAINT "FK_d1b99d22725c12f08ec4280d659"`)
    await queryRunner.query(`DROP TABLE "announcement_target"`)
  }

}
