import { MigrationInterface, QueryRunner } from "typeorm"

export class AddAnnouncementEntity1708522377479 implements MigrationInterface {
  name = 'AddAnnouncementEntity1708522377479'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "announcement" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title_de" character varying NOT NULL, "title_en" character varying NOT NULL, "body_de" character varying NOT NULL, "body_en" character varying NOT NULL, "cta_title_de" character varying, "cta_title_en" character varying, "cta_link_de" character varying, "cta_link_en" character varying, "media_link" jsonb, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e0ef0550174fd1099a308fd18a0" PRIMARY KEY ("id"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "announcement"`)
  }

}
