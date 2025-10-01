import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from './entities/permiso.entity';
import { CategoriasPermisosModule } from '@/categorias_permisos/categorias_permisos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso]), CategoriasPermisosModule],
  controllers: [PermisosController],
  providers: [PermisosService],
  exports: [PermisosService],
})
export class PermisosModule {}
