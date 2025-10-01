import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Permiso } from 'src/permisos/entities/permiso.entity';
import { PermisosModule } from 'src/permisos/permisos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, Usuario, Permiso]), PermisosModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
