import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1759459502658 implements MigrationInterface {
  name = 'Migration1759459502658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "equivalencia_grupos" ("id" SERIAL NOT NULL, "descripcion" character varying(200), "malla_antigua_id" integer NOT NULL, "malla_nueva_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fc78bda0ef051bfe53368fe2a73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."equivalencia_items_lado_enum" AS ENUM('ANTIGUA', 'NUEVA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "equivalencia_items" ("id" SERIAL NOT NULL, "grupo_id" integer NOT NULL, "curso_id" integer NOT NULL, "lado" "public"."equivalencia_items_lado_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_99bd82f7012ebdea99c05b3e4b1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."resultados_homologacion_estado_enum" AS ENUM('HOMOLOGADO', 'INCOMPLETO', 'NO_APLICA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "resultados_homologacion" ("id" SERIAL NOT NULL, "estudiante_id" integer NOT NULL, "malla_antigua_id" integer NOT NULL, "malla_nueva_id" integer NOT NULL, "curso_nuevo_id" integer NOT NULL, "estado" "public"."resultados_homologacion_estado_enum" NOT NULL, "observacion" text NOT NULL, "grupo_id" integer, "cursos_antiguos_presentes" json NOT NULL, "cursos_antiguos_faltantes" json NOT NULL, "cursos_antiguos_seleccionados" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_103a9e2f2790cfc70484c653eac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45d2e780887319a36406baa39c" ON "resultados_homologacion" ("estudiante_id", "malla_antigua_id", "malla_nueva_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" DROP CONSTRAINT "FK_08d2642da319f3779c1a2753fb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "malla_curricular_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ADD CONSTRAINT "FK_08d2642da319f3779c1a2753fb7" FOREIGN KEY ("malla_curricular_id") REFERENCES "mallas_curriculares"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "equivalencia_grupos" ADD CONSTRAINT "FK_7c6b3ade376d94defa4f13a17b4" FOREIGN KEY ("malla_antigua_id") REFERENCES "mallas_curriculares"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "equivalencia_grupos" ADD CONSTRAINT "FK_9208de8d5d8d49de6c37eead7ab" FOREIGN KEY ("malla_nueva_id") REFERENCES "mallas_curriculares"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "equivalencia_items" ADD CONSTRAINT "FK_7b44ddca0d7fe27551eb4cdbf78" FOREIGN KEY ("grupo_id") REFERENCES "equivalencia_grupos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "equivalencia_items" ADD CONSTRAINT "FK_44c81d68e6f23986a4c5583b267" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" ADD CONSTRAINT "FK_2f3c350b6d7439c778bef8300dc" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" ADD CONSTRAINT "FK_6dea3dea15307448b4f03346a1a" FOREIGN KEY ("malla_antigua_id") REFERENCES "mallas_curriculares"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" ADD CONSTRAINT "FK_dd8290f7c0c02151b9021c3eb85" FOREIGN KEY ("malla_nueva_id") REFERENCES "mallas_curriculares"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" ADD CONSTRAINT "FK_a71337f4b556f08452ba9310fc9" FOREIGN KEY ("curso_nuevo_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" ADD CONSTRAINT "FK_50913c6d1901431e99ce34bc455" FOREIGN KEY ("grupo_id") REFERENCES "equivalencia_grupos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" DROP CONSTRAINT "FK_50913c6d1901431e99ce34bc455"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" DROP CONSTRAINT "FK_a71337f4b556f08452ba9310fc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" DROP CONSTRAINT "FK_dd8290f7c0c02151b9021c3eb85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" DROP CONSTRAINT "FK_6dea3dea15307448b4f03346a1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resultados_homologacion" DROP CONSTRAINT "FK_2f3c350b6d7439c778bef8300dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "equivalencia_items" DROP CONSTRAINT "FK_44c81d68e6f23986a4c5583b267"`,
    );
    await queryRunner.query(
      `ALTER TABLE "equivalencia_items" DROP CONSTRAINT "FK_7b44ddca0d7fe27551eb4cdbf78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "equivalencia_grupos" DROP CONSTRAINT "FK_9208de8d5d8d49de6c37eead7ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "equivalencia_grupos" DROP CONSTRAINT "FK_7c6b3ade376d94defa4f13a17b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" DROP CONSTRAINT "FK_08d2642da319f3779c1a2753fb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "malla_curricular_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ADD CONSTRAINT "FK_08d2642da319f3779c1a2753fb7" FOREIGN KEY ("malla_curricular_id") REFERENCES "mallas_curriculares"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45d2e780887319a36406baa39c"`,
    );
    await queryRunner.query(`DROP TABLE "resultados_homologacion"`);
    await queryRunner.query(
      `DROP TYPE "public"."resultados_homologacion_estado_enum"`,
    );
    await queryRunner.query(`DROP TABLE "equivalencia_items"`);
    await queryRunner.query(
      `DROP TYPE "public"."equivalencia_items_lado_enum"`,
    );
    await queryRunner.query(`DROP TABLE "equivalencia_grupos"`);
  }
}
