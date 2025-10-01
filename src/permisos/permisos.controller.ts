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
  ParseIntPipe,
} from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permission.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permissionsService: PermisosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('crear_permisos')
  async createPermission(@Body() createPermissionDto: CreatePermisoDto) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('ver_permisos')
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionsService.findAll(paginationDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('editar_permisos')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermisoDto: UpdatePermisoDto,
  ) {
    return this.permissionsService.update(+id, updatePermisoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('eliminar_permisos')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.permissionsService.remove(+id);
  }
}
