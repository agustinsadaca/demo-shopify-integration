import { MigrationInterface, QueryRunner } from "typeorm"

export class RemoveAudienceEntity1712132515193 implements MigrationInterface {
  name = 'RemoveAudienceEntity1712132515193'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audience" DROP CONSTRAINT "FK_3b857468bd2b7ef1ce531c4891f"`)
    await queryRunner.query(`DROP TABLE "audience"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "audience" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "implementation_id" integer NOT NULL, "questionnaire_id" integer NOT NULL, "answered" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_2ecf18dc010ddf7e956afd9866b" PRIMARY KEY ("id"))`)
    await queryRunner.query(`ALTER TABLE "audience" ADD CONSTRAINT "FK_3b857468bd2b7ef1ce531c4891f" FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaire"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

}
