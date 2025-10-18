import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1759288036318 implements MigrationInterface {
  name = 'Migration1759288036318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categorias_permisos" ("id" SERIAL NOT NULL, "nombre_categoria" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0a7c2a14420be6acd7395650384" UNIQUE ("nombre_categoria"), CONSTRAINT "PK_4d438eb24571d8a919e5d4019a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permisos" ("id" SERIAL NOT NULL, "nombre_permiso" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "categoriaPermisoId" integer, CONSTRAINT "UQ_f42ee3b16329a295d78d28ef196" UNIQUE ("nombre_permiso"), CONSTRAINT "PK_3127bd9cfeb13ae76186d0d9b38" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "nombre_rol" character varying(100) NOT NULL, "descripcion_rol" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a722dfef88f835ff0933fda8c8d" UNIQUE ("nombre_rol"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "nombres" character varying(100) NOT NULL, "apellidos" character varying(100) NOT NULL, "email" character varying(150), "password" character varying(100), "estado" boolean NOT NULL DEFAULT true, "codigo_estudiantil" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuario_token_fcm" ("id" SERIAL NOT NULL, "token_fcm" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "usuario_id" integer, CONSTRAINT "PK_74b834a715d5b627f7763357e77" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "token" text NOT NULL, "ip_address" character varying, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "remember_me" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_43ff9c8aae8700cab0df047ef8" ON "refresh_tokens" ("user_id", "is_active") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roles_permisos" ("rol_id" integer NOT NULL, "permiso_id" integer NOT NULL, CONSTRAINT "PK_0e1dbe0449ae37ef1b31b0d9474" PRIMARY KEY ("rol_id", "permiso_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc3cfbcce511233d4bef92d7e3" ON "roles_permisos" ("rol_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef10d9983fcb45f0024cc7000d" ON "roles_permisos" ("permiso_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "usuarios_roles" ("usuario_id" integer NOT NULL, "rol_id" integer NOT NULL, CONSTRAINT "PK_1213eb778bfb72e49cdf8a25da3" PRIMARY KEY ("usuario_id", "rol_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2c14b9e5e2d0cf077fa4dd3350" ON "usuarios_roles" ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_425dfd009aeeee0c08af9a67a3" ON "usuarios_roles" ("rol_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "permisos" ADD CONSTRAINT "FK_248f2a9ba5f45f1682e5bbff418" FOREIGN KEY ("categoriaPermisoId") REFERENCES "categorias_permisos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuario_token_fcm" ADD CONSTRAINT "FK_da817feecf74880c0418bb2bdee" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_dc3cfbcce511233d4bef92d7e3b" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_ef10d9983fcb45f0024cc7000d3" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios_roles" ADD CONSTRAINT "FK_2c14b9e5e2d0cf077fa4dd33502" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios_roles" ADD CONSTRAINT "FK_425dfd009aeeee0c08af9a67a37" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usuarios_roles" DROP CONSTRAINT "FK_425dfd009aeeee0c08af9a67a37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios_roles" DROP CONSTRAINT "FK_2c14b9e5e2d0cf077fa4dd33502"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_ef10d9983fcb45f0024cc7000d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_dc3cfbcce511233d4bef92d7e3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuario_token_fcm" DROP CONSTRAINT "FK_da817feecf74880c0418bb2bdee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permisos" DROP CONSTRAINT "FK_248f2a9ba5f45f1682e5bbff418"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_425dfd009aeeee0c08af9a67a3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2c14b9e5e2d0cf077fa4dd3350"`,
    );
    await queryRunner.query(`DROP TABLE "usuarios_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ef10d9983fcb45f0024cc7000d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc3cfbcce511233d4bef92d7e3"`,
    );
    await queryRunner.query(`DROP TABLE "roles_permisos"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_43ff9c8aae8700cab0df047ef8"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "usuario_token_fcm"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permisos"`);
    await queryRunner.query(`DROP TABLE "categorias_permisos"`);
  }
}
