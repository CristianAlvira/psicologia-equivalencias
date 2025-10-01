import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1759292163697 implements MigrationInterface {
    name = 'Migration1759292163697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cursos_semestre_enum" AS ENUM('Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Septimo', 'Octavo', 'Noveno', 'Decimo', 'Undecimo', 'Duodecimo')`);
        await queryRunner.query(`CREATE TABLE "cursos" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "creditos" integer NOT NULL, "semestre" "public"."cursos_semestre_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "malla_curricular_id" integer, CONSTRAINT "PK_391c5a635ef6b4bd0a46cb75653" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cursos" ADD CONSTRAINT "FK_08d2642da319f3779c1a2753fb7" FOREIGN KEY ("malla_curricular_id") REFERENCES "mallas_curriculares"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cursos" DROP CONSTRAINT "FK_08d2642da319f3779c1a2753fb7"`);
        await queryRunner.query(`DROP TABLE "cursos"`);
        await queryRunner.query(`DROP TYPE "public"."cursos_semestre_enum"`);
    }

}
