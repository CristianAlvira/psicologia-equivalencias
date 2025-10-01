import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Query,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permission.decorator';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('crear_roles')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Asignar roles a un usuario (LOS SOBREESCRIBE)' })
  @Patch('usuarios/:id/assign')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('asginar_roles')
  async assignRoles(@Body() assignRolesDto: AssignRolesDto) {
    return this.rolesService.assignRolesToUser(assignRolesDto);
  }

  @ApiOperation({
    summary: 'Agregar roles a un usuario (LOS AÑADE A LOS EXISTENTES)',
  })
  @Patch('usuarios/:id/add')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('agregar_roles')
  async addRolesToUser(@Body() addRolesDto: AssignRolesDto) {
    return this.rolesService.addRolesToUser(addRolesDto);
  }

  @ApiOperation({ summary: 'Remover los roles de un usuario' })
  @Patch('usuarios/:id/remove')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('borrar_roles_de_usuario')
  async removeRolesFromUser(@Body() assignRolesDto: AssignRolesDto) {
    return this.rolesService.removeRolesFromUser(assignRolesDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('ver_roles')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.rolesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('ver_rol')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('eliminar_roles')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.remove(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('editar_roles')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.rolesService.update(id, updateRoleDto);
  }
}
