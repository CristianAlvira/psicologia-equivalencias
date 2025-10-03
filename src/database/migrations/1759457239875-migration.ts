import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1759457239875 implements MigrationInterface {
    name = 'Migration1759457239875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "seleccion_estudiante" ("id" SERIAL NOT NULL, "estudiante_id" integer, "curso_antiguo_id" integer, CONSTRAINT "PK_4c3f15e4475c6d3b3afa6a1e8a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "seleccion_estudiante" ADD CONSTRAINT "FK_4f57907533837306820609a1233" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seleccion_estudiante" ADD CONSTRAINT "FK_ab2870d24ad3cdef80c5f812721" FOREIGN KEY ("curso_antiguo_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seleccion_estudiante" DROP CONSTRAINT "FK_ab2870d24ad3cdef80c5f812721"`);
        await queryRunner.query(`ALTER TABLE "seleccion_estudiante" DROP CONSTRAINT "FK_4f57907533837306820609a1233"`);
        await queryRunner.query(`DROP TABLE "seleccion_estudiante"`);
    }

}
