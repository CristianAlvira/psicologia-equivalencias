import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1760674080812 implements MigrationInterface {
    name = 'Migration1760674080812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."equivalencia_grupos_tipo_enum" AS ENUM('COMPLETA', 'OPCIONAL_ANTIGUA', 'OPCIONAL_NUEVA')`);
        await queryRunner.query(`ALTER TABLE "equivalencia_grupos" ADD "tipo" "public"."equivalencia_grupos_tipo_enum" NOT NULL DEFAULT 'COMPLETA'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equivalencia_grupos" DROP COLUMN "tipo"`);
        await queryRunner.query(`DROP TYPE "public"."equivalencia_grupos_tipo_enum"`);
    }

}
