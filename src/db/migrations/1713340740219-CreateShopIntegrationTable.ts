import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateShopIntegrationTable1713340740219 implements MigrationInterface {
  name = 'CreateShopIntegrationTable1713340740219'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "shop_integration_history" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shop_integration_id" integer NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_850a5f523f455675591fadb1c9f" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE TABLE "shop_integration" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shop_system" character varying NOT NULL, "shop_url" character varying NOT NULL, "access_token" character varying NOT NULL, "current_status" character varying NOT NULL, "nos_company_id" integer, CONSTRAINT "PK_aa54695fac3e9293bb477865c37" PRIMARY KEY ("id"))`)
    await queryRunner.query(`ALTER TABLE "shop_integration_history" ADD CONSTRAINT "FK_77b4f182d35cb8d7f187f1924f3" FOREIGN KEY ("shop_integration_id") REFERENCES "shop_integration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shop_integration_history" DROP CONSTRAINT "FK_77b4f182d35cb8d7f187f1924f3"`)
    await queryRunner.query(`DROP TABLE "shop_integration"`)
    await queryRunner.query(`DROP TABLE "shop_integration_history"`)
  }

}
