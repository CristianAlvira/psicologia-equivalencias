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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
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
import { CreateEstudianteDto } from './dto/create-estudiante';

@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Extrae la IP real del cliente, manejando proxies y localhost
   */
  private extractRealIP(req: Request): string {
    // Buscar en headers de proxy primero
    const forwarded = req.get('X-Forwarded-For');
    if (forwarded) {
      // X-Forwarded-For puede contener múltiples IPs separadas por comas
      const ips = forwarded.split(',').map((ip) => ip.trim());
      const realIP = ips[0]; // La primera IP es generalmente la real
      if (realIP && realIP !== '::1' && realIP !== '127.0.0.1') {
        return realIP;
      }
    }

    // Otros headers comunes de proxy
    const realIP = req.get('X-Real-IP');
    if (realIP && realIP !== '::1' && realIP !== '127.0.0.1') {
      return realIP;
    }

    const clientIP = req.get('X-Client-IP');
    if (clientIP && clientIP !== '::1' && clientIP !== '127.0.0.1') {
      return clientIP;
    }

    // Fallback a req.ip o connection.remoteAddress
    let ip =
      req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;

    // Convertir ::1 (IPv6 localhost) a 127.0.0.1 (IPv4 localhost)
    if (ip === '::1') {
      ip = '127.0.0.1';
    }

    // En desarrollo, usar una IP ficticia si es localhost
    if (ip === '127.0.0.1' || ip === 'localhost') {
      return process.env.NODE_ENV === 'production' ? ip : '192.168.1.100';
    }

    return ip || 'unknown';
  }

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('crear_usuarios')
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @Req() req: Request,
  ) {
    const usuario = await this.usuariosService.create(createUsuarioDto);

    // Registrar información de auditoría del consentimiento
    if (
      createUsuarioDto.acepta_tratamiento_datos &&
      'id' in usuario &&
      typeof usuario.id === 'number'
    ) {
      const ipAddress = this.extractRealIP(req);
      const userAgent = req.get('User-Agent') || 'unknown';

      await this.usuariosService.actualizarConsentimientoConAuditoria(
        usuario.id,
        ipAddress,
        userAgent,
      );
    }

    return usuario;
  }

  @ApiOperation({ summary: 'Registrar un nuevo estudiante' })
  @Post('estudiantes')
  async createStudent(
    @Body() createEstudianteDto: CreateEstudianteDto,
    @Req() req: Request,
  ) {
    const estudiante =
      await this.usuariosService.createEstudiante(createEstudianteDto);

    // Registrar información de auditoría del consentimiento
    if (
      createEstudianteDto.acepta_tratamiento_datos &&
      typeof estudiante === 'object' &&
      'id' in estudiante &&
      typeof estudiante.id === 'number'
    ) {
      const ipAddress = this.extractRealIP(req);
      const userAgent = req.get('User-Agent') || 'unknown';

      await this.usuariosService.actualizarConsentimientoConAuditoria(
        estudiante.id,
        ipAddress,
        userAgent,
      );
    }

    return estudiante;
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
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions('ver_usuario')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

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
