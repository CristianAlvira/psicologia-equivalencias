import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from '@/roles/entities/rol.entity';
import { EquivalenciasModule } from '@/equivalencias/equivalencias.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol]), EquivalenciasModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
