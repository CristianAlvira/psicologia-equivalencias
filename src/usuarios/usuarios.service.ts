import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Rol } from '@/roles/entities/rol.entity';
import { FilterUsuariosQueryDto } from './dto/filter-usuarios-query.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const hashedPassword = bcrypt.hashSync(createUsuarioDto.password, 10);

    // Buscar las entidades de roles correspondientes para asignarlas
    const roles =
      createUsuarioDto.roles && createUsuarioDto.roles.length > 0
        ? await this.rolRepository.find({
            where: { id: In(createUsuarioDto.roles) },
          })
        : [];

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
      roles: roles,
    });

    const savedUser = await this.usuarioRepository.save(usuario);
    const { password, ...savedUserWithoutPassword } = savedUser;
    void password;

    return savedUserWithoutPassword;
  }

  async findAll(filterDto: FilterUsuariosQueryDto) {
    const { limit = 10, offset = 0, estado, rol } = filterDto;
    const skip = offset;

    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .skip(skip);

    if (limit !== -1) {
      queryBuilder.take(limit);
    }

    if (rol) {
      queryBuilder.andWhere('roles.nombre_rol ILIKE :rol', { rol: `%${rol}%` });
    }

    if (estado !== undefined) {
      queryBuilder.andWhere('usuario.isActive = :estado', { estado });
    }

    const [usuarios, total] = await queryBuilder.getManyAndCount();

    return {
      data: usuarios.map(({ password, ...usuario }) => {
        void password;
        return usuario;
      }),
      total,
      limit,
      offset,
      totalPages: limit !== -1 ? Math.ceil(total / limit) : 1,
    };
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const { password, ...usuarioWithoutPassword } = usuario;
    void password;
    return usuarioWithoutPassword;
  }

  async findOneByEmail(email: string) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .where('usuario.email = :email', { email })
      .getOne();

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se están actualizando los roles
    if (updateUsuarioDto.roles) {
      const nuevosRoles = await this.rolRepository.find({
        where: { id: In(updateUsuarioDto.roles) },
      });
      usuario.roles = nuevosRoles;
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = bcrypt.hashSync(
        updateUsuarioDto.password,
        10,
      );
    }

    Object.assign(usuario, updateUsuarioDto);
    await this.usuarioRepository.save(usuario);

    const { password, ...updatedUserWithoutPassword } = usuario;
    void password;
    return updatedUserWithoutPassword;
  }

  async remove(id: number) {
    const user = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuarioRepository.remove(user);
    return { message: 'Usuario eliminado correctamente' };
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Hashear la nueva contraseña
    const hashedNewPassword = bcrypt.hashSync(changePasswordDto.password, 10);

    // Actualizar la contraseña
    await this.usuarioRepository.update(id, {
      password: hashedNewPassword,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
