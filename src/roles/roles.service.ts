import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Rol } from './entities/rol.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { PermisosService } from 'src/permisos/permisos.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Permiso } from 'src/permisos/entities/permiso.entity';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Permiso)
    private permisoRepository: Repository<Permiso>,
    private readonly permisosService: PermisosService,
    private readonly dataSource: DataSource,
  ) {}
  async create(createRoleDto: CreateRoleDto): Promise<Rol> {
    if (Object.keys(createRoleDto).length === 0) {
      throw new BadRequestException(
        'El cuerpo de la solicitud no puede estar vacío',
      );
    }
    const permisos = await this.permisosService.findMany(
      createRoleDto.permisos,
    );

    const { permisos: _, ...rest } = createRoleDto;

    const role = this.rolRepository.create(rest);
    role.permisos = permisos;

    await this.rolRepository.save(role);

    return role;
  }

  async assignRolesToUser(assignRolesDto: AssignRolesDto): Promise<Usuario> {
    const { usuario_id, role_ids } = assignRolesDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuario_id },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuario_id} no encontrado`);
    }

    const roles = await this.rolRepository.findBy({
      id: In(role_ids),
    });

    if (roles.length !== role_ids.length) {
      const foundIds = roles.map((r) => r.id);
      const missingIds = role_ids.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Roles no encontrados: ${missingIds.join(', ')}`,
      );
    }

    usuario.roles = roles;

    return await this.usuarioRepository.save(usuario);
  }

  async addRolesToUser(assignRolesDto: AssignRolesDto): Promise<Usuario> {
    const { usuario_id, role_ids } = assignRolesDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuario_id },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuario_id} no encontrado`);
    }

    const existingRoleIds = usuario.roles.map((r) => r.id);

    const newRoleIds = role_ids.filter((id) => !existingRoleIds.includes(id));

    if (newRoleIds.length === 0) {
      throw new BadRequestException(
        'El usuario ya tiene todos estos roles asignados',
      );
    }

    const newRoles = await this.rolRepository.findBy({
      id: In(newRoleIds),
    });

    if (newRoles.length !== newRoleIds.length) {
      const foundIds = newRoles.map((r) => r.id);
      const missingIds = newRoleIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Roles no encontrados: ${missingIds.join(', ')}`,
      );
    }

    usuario.roles = [...usuario.roles, ...newRoles];

    return await this.usuarioRepository.save(usuario);
  }

  async removeRolesFromUser(assignRolesDto: AssignRolesDto): Promise<Usuario> {
    const { usuario_id, role_ids } = assignRolesDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuario_id },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuario_id} no encontrado`);
    }

    usuario.roles = usuario.roles.filter((role) => !role_ids.includes(role.id));

    return await this.usuarioRepository.save(usuario);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    if (limit === -1) {
      return await this.rolRepository.find();
    }

    return await this.rolRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: number): Promise<Rol> {
    const role = await this.rolRepository
      .createQueryBuilder('rol')
      .leftJoinAndSelect('rol.permisos', 'permiso')
      .leftJoinAndSelect('permiso.categoria_permiso', 'categoria_permiso')
      .where('rol.id = :id', { id })
      .getOne(); // Cargar los permisos del rol

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Rol> {
    const role = await this.rolRepository.findOne({
      where: { id },
      relations: ['permisos'],
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    if (Object.keys(updateRoleDto).length === 0) {
      throw new BadRequestException(
        'El cuerpo de la solicitud no puede estar vacío',
      );
    }

    if (updateRoleDto.permisos && updateRoleDto.permisos.length === 0) {
      throw new BadRequestException(
        'El array de permisos no puede estar vacío',
      );
    }

    if (updateRoleDto.nombre_rol) {
      role.nombre_rol = updateRoleDto.nombre_rol;
    }
    if (updateRoleDto.descripcion_rol !== undefined) {
      role.descripcion_rol = updateRoleDto.descripcion_rol;
    }

    if (updateRoleDto.permisos && updateRoleDto.permisos.length > 0) {
      const permisos = await this.permisosService.findMany(
        updateRoleDto.permisos,
      );
      role.permisos = permisos;
    }

    await this.rolRepository.save(role);
    return role;
  }

  async remove(
    id: number,
  ): Promise<{ message: string; rolEliminado: Partial<Rol> }> {
    const role = await this.rolRepository.findOne({
      where: { id },
      relations: ['usuarios', 'permisos'],
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    if (role.usuarios && role.usuarios.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el rol porque está asignado a ${role.usuarios.length} usuario(s). Primero debe remover este rol de todos los usuarios.`,
      );
    }

    const rolInfo: Partial<Rol> = {
      id: role.id,
      nombre_rol: role.nombre_rol,
      descripcion_rol: role.descripcion_rol,
    };

    await this.rolRepository.remove(role);

    return {
      message: `Rol "${rolInfo.nombre_rol}" eliminado correctamente`,
      rolEliminado: rolInfo,
    };
  }
}
