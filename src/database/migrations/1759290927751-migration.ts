import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1759290927751 implements MigrationInterface {
    name = 'Migration1759290927751'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "programas" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ac0fcdc9da59354e01bb09bbc22" UNIQUE ("nombre"), CONSTRAINT "PK_0eb3b38bfa274b4cbf0882232c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mallas_curriculares" ("id" SERIAL NOT NULL, "version" character varying(100) NOT NULL, "programa_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_48926071ce96aa38743e0233b9c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mallas_curriculares" ADD CONSTRAINT "FK_d81878b00427d80605855500c47" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mallas_curriculares" DROP CONSTRAINT "FK_d81878b00427d80605855500c47"`);
        await queryRunner.query(`DROP TABLE "mallas_curriculares"`);
        await queryRunner.query(`DROP TABLE "programas"`);
    }

}
