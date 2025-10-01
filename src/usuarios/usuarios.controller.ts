import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/guards/permission.guard';
import { RequirePermissions } from '@/auth/decorators/permission.decorator';
import { FilterUsuariosQueryDto } from './dto/filter-usuarios-query.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Usuario } from './entities/usuario.entity';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @ApiOperation({
    summary: 'Crear usuario. si es rol "conductor" debe crear el anexo ',
  })
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('crear_usuarios')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('ver_usuarios')
  findAll(@Query() filters: FilterUsuariosQueryDto) {
    return this.usuariosService.findAll(filters);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('ver_usuario')
  findProfile(@CurrentUser() user: Usuario) {
    return this.usuariosService.findOne(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('ver_usuario')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  // @Get('estado/:estado')
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions('usuarios:read')
  // findByEstado(@Param('estado') estado: string) {
  //   // Convertimos el string que nos pasan a boolean
  //   const estadoBool = estado === 'true';
  //   return this.usuariosService.findByEstado(estadoBool);
  // }

  // @Get('rol/:rol')
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions('usuarios:read')
  // findByRol(@Param('rol') rol: string) {
  //   return this.usuariosService.findByRol(rol);
  // }

  // TODO: Crear filtro por si el usuario tiene un vehiculo asignado

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('editar_usuarios')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('eliminar_usuarios')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('editar_usuarios')
  changePassword(
    @Param('id') id: string,
    @Body() passwordDto: ChangePasswordDto,
  ) {
    return this.usuariosService.changePassword(+id, passwordDto);
  }
}
