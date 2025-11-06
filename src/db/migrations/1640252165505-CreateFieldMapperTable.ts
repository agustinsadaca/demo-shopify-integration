import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateFieldMapperTable1640252165505 implements MigrationInterface {
  name = 'CreateFieldMapperTable1640252165505'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "field_mapper" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entity_type" character varying NOT NULL, "entity_field" character varying NOT NULL, "wms_value" character varying NOT NULL, "shop_value" character varying NOT NULL, "implementation_id" integer NOT NULL, CONSTRAINT "PK_e9417d3dd487043194eb62c2f5f" PRIMARY KEY ("id"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "field_mapper"`)
  }

}
