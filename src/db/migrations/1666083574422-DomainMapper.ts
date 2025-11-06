import { MigrationInterface, QueryRunner } from "typeorm"

export class DomainMapper1666083574422 implements MigrationInterface {
  name = 'DomainMapper1666083574422'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "domain_mapper" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "implementation_id" integer NOT NULL, "domain" character varying NOT NULL, CONSTRAINT "UQ_123548e66255e35c3505411d12b" UNIQUE ("domain"), CONSTRAINT "PK_3722d4e1acc3b474e2844f5d0cd" PRIMARY KEY ("id"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "domain_mapper"`)
  }

}
