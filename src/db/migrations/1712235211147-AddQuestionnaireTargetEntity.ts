import { MigrationInterface, QueryRunner } from "typeorm"

export class AddQuestionnaireTargetEntity1712235211147 implements MigrationInterface {
  name = 'AddQuestionnaireTargetEntity1712235211147'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "questionnaire_target" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "implementation_id" integer NOT NULL, "questionnaire_id" integer NOT NULL, "answered" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_7f3c18a7675ee9012010abd4bef" PRIMARY KEY ("id"))`)
    await queryRunner.query(`ALTER TABLE "questionnaire_target" ADD CONSTRAINT "FK_40be8ae34a44f540a4b51e391b8" FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaire"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "questionnaire_target" DROP CONSTRAINT "FK_40be8ae34a44f540a4b51e391b8"`)
    await queryRunner.query(`DROP TABLE "questionnaire_target"`)
  }

}
