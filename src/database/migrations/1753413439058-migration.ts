import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1753413439058 implements MigrationInterface {
    name = 'Migration1753413439058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c415d9dfd60b8eed6c690164846"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "REL_c415d9dfd60b8eed6c69016484"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "anexo_usuario_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "anexo_usuario_id" integer`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "REL_c415d9dfd60b8eed6c69016484" UNIQUE ("anexo_usuario_id")`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_c415d9dfd60b8eed6c690164846" FOREIGN KEY ("anexo_usuario_id") REFERENCES "anexos_usuarios"("id_anexo_usuario") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
