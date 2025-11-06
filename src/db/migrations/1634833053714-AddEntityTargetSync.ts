import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEntityTargetSync1634833053714 implements MigrationInterface {
    name = 'AddEntityTargetSync1634833053714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "target_sync" ("id" SERIAL NOT NULL, "entity_type" character varying NOT NULL, "connection_auth_id" integer NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entity_count" integer, CONSTRAINT "PK_efa202dab9775bd540daf2dbd32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "target_sync" ADD CONSTRAINT "FK_feff0a2a52791dc983296d4f95b" FOREIGN KEY ("connection_auth_id") REFERENCES "connection_auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "target_sync" DROP CONSTRAINT "FK_feff0a2a52791dc983296d4f95b"`);
        await queryRunner.query(`DROP TABLE "target_sync"`);
    }

}
