import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1760983485198 implements MigrationInterface {
    name = 'Migration1760983485198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "acepta_tratamiento_datos" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "fecha_consentimiento" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "ip_consentimiento" character varying(15)`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "user_agent_consentimiento" text`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "version_politicas" character varying(20)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "version_politicas"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "user_agent_consentimiento"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "ip_consentimiento"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "fecha_consentimiento"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "acepta_tratamiento_datos"`);
    }

}
