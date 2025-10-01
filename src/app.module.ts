import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseErrorHandler } from './common/filters/database-filter.filter';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasPermisosModule } from './categorias_permisos/categorias_permisos.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      // Validar el manejo de las migraciones
      synchronize: false,
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      logging: process.env.NODE_ENV === 'dev' ? true : ['error'],
      ssl:
        process.env.NODE_ENV === 'prod' ? { rejectUnauthorized: false } : false,
    }),

    UsuariosModule,

    RolesModule,

    PermisosModule,

    AuthModule,

    CategoriasPermisosModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DatabaseErrorHandler,
    },
  ],
})
export class AppModule {}
