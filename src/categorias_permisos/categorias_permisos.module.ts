import { Module } from '@nestjs/common';
import { CategoriasPermisosService } from './categorias_permisos.service';
import { CategoriasPermisosController } from './categorias_permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasPermiso } from './entities/categorias_permiso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriasPermiso])],
  controllers: [CategoriasPermisosController],
  providers: [CategoriasPermisosService],
  exports: [CategoriasPermisosService],
})
export class CategoriasPermisosModule {}
