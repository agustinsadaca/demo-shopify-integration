import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionnaireEntity1711024912979 implements MigrationInterface {
    name = 'AddQuestionnaireEntity1711024912979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "questionnaire" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "html_snippet" character varying NOT NULL, "layout" character varying, "completion_rule" character varying, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e8232a11eaabac903636eb7e71e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "questionnaire"`);
    }

}
